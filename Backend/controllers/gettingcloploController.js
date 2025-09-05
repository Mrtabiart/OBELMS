const Subject = require('../models/subjectModel');
const mongoose = require('mongoose');

// ✅ Cache for frequently accessed data (optional but very effective)
const cache = new Map();
const CACHE_TTL = 300000; // 5 minutes cache

exports.getCLOtoPLOMapping = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // ✅ Input validation first (fastest check)
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID format" });
    }

    // ✅ Check cache first (super fast)
    const cacheKey = `cloplo:${courseId}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_TTL) {
      return res.status(200).json(cachedData.response);
    }

    // ✅ Optimized database query with projection and lean
    const subject = await Subject.findById(courseId)
      .select('name code clos.clonumber clos.ploNumber')
      .lean()
      .maxTimeMS(2000); // 2 second timeout for safety

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // ✅ Pre-allocate objects for better performance
    const cloToPloMapping = {};
    const cloDetails = {};
    
    // ✅ Ultra-fast processing with minimal operations
    if (subject.clos && subject.clos.length > 0) {
      const closLength = subject.clos.length;
      
      for (let i = 0; i < closLength; i++) {
        const clo = subject.clos[i];
        
        // ✅ Skip invalid entries quickly
        if (!clo || !clo.ploNumber) continue;
        
        const cloKey = `clo${i + 1}`;
        const cloNumber = clo.clonumber || (i + 1);
        
        cloToPloMapping[cloKey] = `PLO ${clo.ploNumber}`;
        
        cloDetails[cloKey] = {
          cloNumber: cloNumber,
          ploNumber: clo.ploNumber,
          cloId: clo._id ? clo._id.toString() : `clo_${i + 1}`,
          ploValue: `PLO ${clo.ploNumber}`,
          originalIndex: i
        };
      }
    }

    // ✅ Only create default mapping if absolutely necessary
    let needsDefaultMapping = Object.keys(cloToPloMapping).length === 0;
    
    const response = {
      courseId: subject._id,
      courseName: subject.name,
      courseCode: subject.code,
      cloToPloMapping: needsDefaultMapping ? {
        clo1: 'PLO 1',
        clo2: 'PLO 2', 
        clo3: 'PLO 3'
      } : cloToPloMapping,
      cloDetails: needsDefaultMapping ? {
        clo1: { 
          cloNumber: 1, 
          ploNumber: 1, 
          cloId: 'default_clo1',
          ploValue: 'PLO 1',
          originalIndex: 0
        },
        clo2: { 
          cloNumber: 2, 
          ploNumber: 2, 
          cloId: 'default_clo2',
          ploValue: 'PLO 2',
          originalIndex: 1
        },
        clo3: { 
          cloNumber: 3, 
          ploNumber: 3, 
          cloId: 'default_clo3',
          ploValue: 'PLO 3',
          originalIndex: 2
        }
      } : cloDetails
    };

    // ✅ Cache the response for future requests
    cache.set(cacheKey, {
      response: response,
      timestamp: Date.now()
    });

    // ✅ Set cache headers for client-side caching
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('X-Response-Time', Date.now());
    
    res.status(200).json(response);
    
  } catch (error) {
    // ✅ Fast error handling
    console.error('CLO-PLO Mapping Error:', error.message);
    
    res.status(500).json({
      message: "Failed to fetch CLO-PLO mapping",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, 60000); 