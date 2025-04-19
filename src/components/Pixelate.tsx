import React from 'react'

export default function Pixelate({
    children,
    className
}: {
    children: string,
    className?: string,
}) {
    const shouldPixelate = (letter: string) => {
        return ['a', 'u', 'y', 'd', 's', 'g', 'k', 'p', '0'].includes(letter.toLowerCase());
    };

    const processedText = children.split('').map((letter, index) => (
        shouldPixelate(letter) ?
            <span key={index} style={{ fontFeatureSettings: '"ss15"' }}>{letter}</span> :
            letter
    ));

    return (
        <h2 className={`${className}`}>{processedText}</h2>
    )
}
