import React, { useState } from 'react';
import ThreeDButton from './ThreeDButton';
import styles from './SummaryButton.module.css';

interface SummaryButtonProps {
  title: string;
  content: string;
  className?: string;
}

const SummaryButton: React.FC<SummaryButtonProps> = ({
  title = "Chapter Summary",
  content = "No summary available for this chapter.",
  className = ""
}) => {
  const [showSummary, setShowSummary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSummaryClick = async () => {
    if (showSummary) {
      setShowSummary(false);
      return;
    }

    setIsLoading(true);

    // Simulate loading time for summary generation
    setTimeout(() => {
      setIsLoading(false);
      setShowSummary(true);
    }, 800);
  };

  const handleRegenerate = () => {
    setShowSummary(false);
    setTimeout(() => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setShowSummary(true);
      }, 800);
    }, 300);
  };

  return (
    <div className={`${styles.summaryContainer} ${className}`}>
      <ThreeDButton
        variant="primary"
        onClick={handleSummaryClick}
        disabled={isLoading}
        className={styles.summaryButton}
      >
        {isLoading ? (
          <>
            <span className={styles.loadingSpinner}></span>
            Generating...
          </>
        ) : showSummary ? (
          "Hide Summary"
        ) : (
          "Show Summary"
        )}
      </ThreeDButton>

      {showSummary && (
        <div className={styles.summaryContent}>
          <div className={styles.summaryHeader}>
            <h3>{title}</h3>
            <ThreeDButton
              variant="secondary"
              size="small"
              onClick={handleRegenerate}
              className={styles.regenerateButton}
            >
              Regenerate
            </ThreeDButton>
          </div>
          <div className={styles.summaryText}>
            {content}
          </div>
          <div className={styles.summaryActions}>
            <ThreeDButton variant="success" size="small">
              Save Summary
            </ThreeDButton>
            <ThreeDButton variant="warning" size="small">
              Share
            </ThreeDButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryButton;