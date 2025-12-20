import React from 'react';
import Layout from '@theme/Layout';
import { useAuth } from '../contexts/AuthContext';
import ThreeDButton from '../components/ThreeDButton';
import clsx from 'clsx';
import styles from './author.module.css';

function AuthorPage() {
  const { currentUser, loading } = useAuth();

  return (
    <Layout title="About the Author" description="Learn about the author of this Physical AI textbook">
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <div className={styles.authorCard}>
              <div className={styles.authorHeader}>
                <div className={styles.authorProfilePic}>
                  <img
                    src="/img/profile-pic.png"
                    alt="Author Profile"
                    onError={(e) => {
                      // Fallback to default user icon if image fails to load
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      const iconDiv = e.target.parentElement.querySelector('.default-icon');
                      if (iconDiv) iconDiv.style.display = 'flex';
                    }}
                  />
                  <div className={clsx('default-icon', styles.defaultIcon)}>
                    <i className="fas fa-user"></i>
                  </div>
                </div>
                <div className={styles.authorInfo}>
                  <h1 className={styles.authorName}>Sana Khalid</h1>
                  <p className={styles.authorTitle}>Author & Educator</p>
                  <p className={styles.authorEmail}>sana.khalid@example.com</p>
                </div>
              </div>

              <div className={styles.authorBio}>
                <h2>About the Author</h2>
                <p>
                  Sana Khalid is an expert in Physical AI and Humanoid Robotics with extensive experience in both academic research and practical applications.
                  She has dedicated her career to making complex robotics concepts accessible to students and enthusiasts.
                </p>

                <p>
                  With a background in computer science and robotics engineering, Sana has contributed to various research projects focused on
                  embodied AI, sensor integration, and humanoid locomotion. Her passion lies in creating educational content that bridges the gap
                  between theoretical knowledge and hands-on implementation.
                </p>
              </div>

              <div className={styles.authorExpertise}>
                <h3>Areas of Expertise</h3>
                <div className={styles.expertiseGrid}>
                  <div className={styles.expertiseItem}>
                    <i className="fas fa-robot"></i>
                    <h4>Humanoid Robotics</h4>
                    <p>Design and control of human-like robotic systems</p>
                  </div>
                  <div className={styles.expertiseItem}>
                    <i className="fas fa-brain"></i>
                    <h4>Embodied AI</h4>
                    <p>Intelligence emerging from environment interaction</p>
                  </div>
                  <div className={styles.expertiseItem}>
                    <i className="fas fa-microchip"></i>
                    <h4>Sensor Integration</h4>
                    <p>Perception systems for robotic applications</p>
                  </div>
                  <div className={styles.expertiseItem}>
                    <i className="fas fa-cogs"></i>
                    <h4>Control Systems</h4>
                    <p>Motor control and actuation for robotics</p>
                  </div>
                </div>
              </div>

              <div className={styles.authorAchievements}>
                <h3>Featured Content</h3>
                <p>Explore the comprehensive Physical AI & Humanoid Robotics textbook designed for learners at all levels.</p>

                <div className={styles.quickLinks}>
                  <ThreeDButton variant="chapter" href="/docs/intro">
                    <i className="fas fa-book"></i> Start Textbook
                  </ThreeDButton>
                  <ThreeDButton variant="lesson" href="/dashboard">
                    <i className="fas fa-tachometer-alt"></i> Learning Dashboard
                  </ThreeDButton>
                  <ThreeDButton variant="success" href="/docs/chapter-1/intro">
                    <i className="fas fa-graduation-cap"></i> Chapter 1
                  </ThreeDButton>
                </div>
              </div>

              <div className={styles.authorContact}>
                <h3>Connect & Learn More</h3>
                <p>Continue your learning journey with guided content personalized to your level.</p>

                {currentUser ? (
                  <div className={styles.userGreeting}>
                    <p>Thanks for being part of the learning community, {currentUser.profile?.name || currentUser.email?.split('@')[0]}!</p>
                  </div>
                ) : (
                  <div className={styles.ctaSection}>
                    <p>Sign up to track your progress and get personalized content recommendations.</p>
                    <div className={styles.authButtons}>
                      <ThreeDButton variant="primary" href="/register">
                        <i className="fas fa-user-plus"></i> Register
                      </ThreeDButton>
                      <ThreeDButton variant="secondary" href="/login">
                        <i className="fas fa-sign-in-alt"></i> Login
                      </ThreeDButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AuthorPage;