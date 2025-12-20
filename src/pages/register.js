import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { useHistory } from '@docusaurus/router';
import { useAuth } from '../contexts/AuthContext';
import styles from './register.module.css';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    programmingLevel: 'beginner',
    roboticsFamiliarity: 'none',
    learningGoal: 'personalInterest',
    timeCommitment: 'fewHours',
    priorExperience: 'none'
  });
  const [error, setError] = useState('');
  const history = useHistory();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    // Prepare user data for registration
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password, // Note: In a real app, password would be handled securely
      programmingLevel: formData.programmingLevel,
      roboticsFamiliarity: formData.roboticsFamiliarity,
      learningGoal: formData.learningGoal,
      timeCommitment: formData.timeCommitment,
      priorExperience: formData.priorExperience
    };

    try {
      // Call the register function from auth context
      const result = await register(userData);

      // Show welcome message instead of redirecting immediately
      setIsRegistered(true);
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  if (isRegistered) {
    return (
      <Layout title="Welcome!" description="Welcome to the Physical AI textbook">
        <div className="container margin-vert--lg">
          <div className="row">
            <div className="col col--6 col--offset-3">
              <div className="card text--center">
                <div className="card__body">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    <i className="fas fa-check-circle" style={{ color: '#4CAF50' }}></i>
                  </div>
                  <h2>Welcome, {formData.name}!</h2>
                  <p className="margin-bottom--lg">
                    Your account has been successfully created. You're now ready to start your journey in Physical AI and Robotics!
                  </p>
                  <div className="button-group button-group--block">
                    <a href="/" className="button button--primary button--lg">
                      Start Learning
                    </a>
                  </div>
                  <div className="margin-top--lg">
                    <p>Or continue to explore:</p>
                    <div className="button-group">
                      <a href="/docs/chapter-1/intro" className="button button--secondary button--sm">
                        Textbook
                      </a>
                      <a href="/author" className="button button--secondary button--sm">
                        About Author
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Register" description="Register for the Physical AI textbook">
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--6 col--offset-3">
            <div className="card">
              <div className="card__header text--center">
                <h2>Create Your Account</h2>
                <p>Tell us about your background to personalize your learning experience</p>
              </div>
              <div className="card__body">
                {error && <div className="alert alert--danger">{error}</div>}

                <form onSubmit={handleRegister}>
                  <div className="margin-bottom--md">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="margin-bottom--md">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="margin-bottom--md">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="margin-bottom--lg">
                    <label className="form-label">Programming Level</label>
                    <div className={styles.radioGroup}>
                      {['beginner', 'intermediate', 'advanced'].map((level) => (
                        <label key={level} className={`${styles.radioOption} ${formData.programmingLevel === level ? styles.selected : ''}`}>
                          <input
                            type="radio"
                            name="programmingLevel"
                            value={level}
                            checked={formData.programmingLevel === level}
                            onChange={handleChange}
                            className={styles.radioInput}
                          />
                          <span className={styles.radioText}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="margin-bottom--lg">
                    <label className="form-label">Robotics Familiarity</label>
                    <div className={styles.radioGroup}>
                      {['none', 'basic', 'intermediate', 'advanced'].map((level) => (
                        <label key={level} className={`${styles.radioOption} ${formData.roboticsFamiliarity === level ? styles.selected : ''}`}>
                          <input
                            type="radio"
                            name="roboticsFamiliarity"
                            value={level}
                            checked={formData.roboticsFamiliarity === level}
                            onChange={handleChange}
                            className={styles.radioInput}
                          />
                          <span className={styles.radioText}>
                            {level === 'none' ? 'No Experience' :
                             level === 'basic' ? 'Basic Knowledge' :
                             level.charAt(0).toUpperCase() + level.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="margin-bottom--lg">
                    <label className="form-label">Learning Goal</label>
                    <div className={styles.radioGroup}>
                      {['personalInterest', 'academic', 'professional', 'hobby'].map((goal) => (
                        <label key={goal} className={`${styles.radioOption} ${formData.learningGoal === goal ? styles.selected : ''}`}>
                          <input
                            type="radio"
                            name="learningGoal"
                            value={goal}
                            checked={formData.learningGoal === goal}
                            onChange={handleChange}
                            className={styles.radioInput}
                          />
                          <span className={styles.radioText}>
                            {goal === 'personalInterest' ? 'Personal Interest' :
                             goal === 'academic' ? 'Academic Study' :
                             goal === 'professional' ? 'Professional Development' :
                             'For Fun/Hobby'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="margin-bottom--lg">
                    <label className="form-label">Time Commitment</label>
                    <div className={styles.radioGroup}>
                      {['fewHours', 'oneHour', 'fewTimes', 'daily'].map((time) => (
                        <label key={time} className={`${styles.radioOption} ${formData.timeCommitment === time ? styles.selected : ''}`}>
                          <input
                            type="radio"
                            name="timeCommitment"
                            value={time}
                            checked={formData.timeCommitment === time}
                            onChange={handleChange}
                            className={styles.radioInput}
                          />
                          <span className={styles.radioText}>
                            {time === 'fewHours' ? 'A few hours a week' :
                             time === 'oneHour' ? '1 hour daily' :
                             time === 'fewTimes' ? 'A few times a week' :
                             'Daily'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="margin-bottom--lg">
                    <label className="form-label">Prior Experience</label>
                    <div className={styles.radioGroup}>
                      {['none', 'basic', 'some', 'extensive'].map((exp) => (
                        <label key={exp} className={`${styles.radioOption} ${formData.priorExperience === exp ? styles.selected : ''}`}>
                          <input
                            type="radio"
                            name="priorExperience"
                            value={exp}
                            checked={formData.priorExperience === exp}
                            onChange={handleChange}
                            className={styles.radioInput}
                          />
                          <span className={styles.radioText}>
                            {exp === 'none' ? 'No Prior Experience' :
                             exp === 'basic' ? 'Basic Experience' :
                             exp === 'some' ? 'Some Experience' :
                             'Extensive Experience'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="button-group button-group--block">
                    <button type="submit" className="button button--primary">
                      Create Account
                    </button>
                  </div>
                </form>
              </div>
              <div className="card__footer text--center">
                <p>
                  Already have an account? <a href="/login">Login here</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default RegisterPage;