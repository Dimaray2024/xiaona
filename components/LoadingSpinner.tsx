import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
    return (
        <div className="fixed inset-0 bg-creamy-yellow/70 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="flex flex-col items-center justify-center">
                <div className="flex items-center justify-center space-x-2">
                    <style>
                        {`
                            @keyframes bouncy {
                                0%, 100% { transform: translateY(0); }
                                50% { transform: translateY(-20px); }
                            }
                            .dot {
                                width: 20px;
                                height: 20px;
                                border-radius: 50%;
                                animation: bouncy 1.4s infinite ease-in-out;
                            }
                            .dot1 { background-color: #FBBF24; animation-delay: -0.32s; }
                            .dot2 { background-color: #A7F3D0; animation-delay: -0.16s; }
                            .dot3 { background-color: #FFD6EC; }
                        `}
                    </style>
                    <div className="dot dot1"></div>
                    <div className="dot dot2"></div>
                    <div className="dot dot3"></div>
                </div>
                {message && <p className="text-lg text-amber-600 font-medium mt-6">{message}</p>}
            </div>
        </div>
    );
};

export default LoadingSpinner;