import React from 'react';
import loadingGif from '../assets/loading.gif'; // Ensure you have a loading.gif in the assets folder
import '../styles/Loading.css';

const Loading = () => {
    return (
        <div className="loading-container">
            <img src={loadingGif} alt="Loading..." className="loading-gif" />
        </div>
    );
};

export default Loading;
