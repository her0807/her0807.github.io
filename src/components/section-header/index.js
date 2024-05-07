import React from 'react';
import './style.scss';

function SectionHeader({ title }) {
  return (
    <div className="section-header-wrapper">
      <div className="section-header">
        <meta name="google-site-verification"
              content="Zlcd6hBfFBB4bPhuqK0Ou8LDY5igOHZw1zEuAACcTfA"/>

        <meta name="naver-site-verification"
              content="120fd2d2cc96a4ae55bea23b0e089aeea8f147a9"/>

        <h2>{title}</h2>
      </div>
    </div>
  );
}

export default SectionHeader;
