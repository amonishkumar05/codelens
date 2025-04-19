import React, { useEffect, useState } from 'react';

const steps = [
    "Parsing code structure",
    "Detecting patterns",
    "Analyzing complexity",
    "Evaluating best practices",
    "Generating recommendations"
];

export default function AnalysisLoader() {
    const [activeStep, setActiveStep] = useState(0);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setOpacity(0);
            setTimeout(() => {
                setActiveStep((prev) => (prev + 1) % steps.length);
                setOpacity(1);
            }, 500);
        }, 6000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="relative w-full max-w-md mx-auto mt-24">
            <div className="flex flex-col items-center">
                <div className="relative mb-10">
                    <div className="w-32 h-32 rounded-full border-4 border-primary/30 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full border-4 border-t-transparent border-primary animate-spin"></div>
                    </div>
                    <img src="/scan.svg" alt="scan" className="absolute w-12 h-12 top-1/2 left-1/2 opacity-40 transform -translate-x-1/2 -translate-y-1/2" />
                </div>

                <div className="flex justify-between w-full mb-4">
                    {steps.map((_, index) => (
                        <div key={index} className="relative flex items-center justify-center">
                            <div
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${index < activeStep
                                        ? "bg-primary"
                                        : index === activeStep
                                            ? "bg-primary ring-4 ring-primary/20"
                                            : "bg-gray-300"
                                    }`}
                            ></div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`h-0.5 w-[calc(100%-12px)] absolute left-[14px] transition-all duration-500 ${index < activeStep ? "bg-primary" : "bg-gray-300"
                                        }`}
                                ></div>
                            )}
                        </div>
                    ))}
                </div>

                <div
                    className="text-center text-lg mt-6 font-medium h-8 transition-opacity duration-500 mb-2"
                    style={{ opacity }}
                >
                    {steps[activeStep]}
                </div>
                <p className="text-muted-foreground text-sm">Please wait while we analyze your code</p>
            </div>
        </div>
    );
}