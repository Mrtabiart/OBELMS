import React, { useState } from 'react';
import { Phone, Mail, Building2, Send } from 'lucide-react';
import './Help.css';

const HelpContact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 2000);
  };

  return (
   <div className="department-container">
    <div className="help-container">
      <div className="help-content">
        <div className="help-grid">
          <div className="helpcontact-info">
            <div className="helpheader-section">
              <h1 className="helpmain-title">
                Need Some Help?
                <span className="helpsubtitle">We're Here For You</span>
              </h1>
              <p className="helpdescription">
                Our dedicated team is ready to assist you. 
              </p>
            </div>

            <div className="helpcontact-methods">
              <div className="helpcontact-item">
                <div className="helpicon-container">
                  <Phone className="helpicon" />
                </div>
                <div className="helpcontact-details">
                  <p className="helplabel">Call Us</p>
                  <p className="helpvalue">+92 33 44 806283</p>
                </div>
              </div>

              <div className="helpcontact-item">
                <div className="helpicon-container">
                  <Mail className="helpicon" />
                </div>
                <div className="helpcontact-details">
                  <p className="helplabel">Email Us</p>
                  <p className="helpvalue">Mrtabiart@gmail.com</p>
                </div>
              </div>

              <div className="helpcontact-item">
                <div className="helpicon-container">
                  <Building2 className="helpicon" />
                </div>
                <div className="helpcontact-details">
                  <p className="helplabel">Visit Us</p>
                  <p className="helpvalue">Main Jaranwala Road 5KM Near Sadar Police Station</p>
                </div>
              </div>
            </div>
          </div>
          <div className="helpform-container">
            <div className="helpform-background"></div>
            <div className="helpform-content">
              <form onSubmit={handleSubmit}>
                <div className="helpform-group">
                  <label htmlFor="helpname"  className="helplabel">Full Name</label>
                  <input
                    className="helpinput"
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="helpform-group">
                  <label htmlFor="email"  className="helplabel">Email Address</label>
                  <input
                    className="helpinput"
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="helpform-group">
                  <label htmlFor="phone" className="helplabel">Phone Number</label>
                  <input
                    className="helpinput"
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="helpform-group">
                  <label htmlFor="helpmessage"  className="helplabel">Your Message</label>
                  <textarea
                    className="helptextarea"
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button type="submit" disabled={isSubmitting} className="helpsubmit-button">
                  {isSubmitting ? (
                    <div className="helploading-spinner"></div>
                  ) : (
                    <>
                      <Send className="helpsend-icon" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

  );
};

export default HelpContact;