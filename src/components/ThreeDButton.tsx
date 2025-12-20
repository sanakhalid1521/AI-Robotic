import React from 'react';
import clsx from 'clsx';
import styles from './ThreeDButton.module.css';

interface ThreeDButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'chapter' | 'lesson';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  href?: string;
  target?: string;
  disabled?: boolean;
}

const ThreeDButton: React.FC<ThreeDButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  className = '',
  href,
  target,
  disabled = false,
}) => {
  const buttonClasses = clsx(
    styles.threeDButton,
    styles[`threeDButton--${variant}`],
    styles[`threeDButton--${size}`],
    {
      [styles['threeDButton--disabled']]: disabled,
    },
    className
  );

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  if (href) {
    return (
      <a
        href={href}
        target={target}
        className={buttonClasses}
        onClick={handleClick}
        aria-disabled={disabled}
      >
        <span className={styles.threeDButton__content}>{children}</span>
      </a>
    );
  }

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      <span className={styles.threeDButton__content}>{children}</span>
    </button>
  );
};

export default ThreeDButton;