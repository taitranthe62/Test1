import React from 'react';
import { XIcon } from './icons/XIcon';

interface LatexGuideProps {
  onClose: () => void;
}

const LatexGuide: React.FC<LatexGuideProps> = ({ onClose }) => {
  const examples = [
    {
      category: 'Basic Math',
      items: [
        { latex: '$x + y = z$', desc: 'Inline equation' },
        { latex: '$$E = mc^2$$', desc: 'Display equation' },
        { latex: '$x^2 + y^2 = r^2$', desc: 'Superscript' },
        { latex: '$x_1, x_2, x_n$', desc: 'Subscript' },
      ]
    },
    {
      category: 'Fractions & Roots',
      items: [
        { latex: '$\\\\frac{a}{b}$', desc: 'Fraction' },
        { latex: '$\\\\sqrt{x}$', desc: 'Square root' },
        { latex: '$\\\\sqrt[n]{x}$', desc: 'N-th root' },
        { latex: '$\\\\frac{dy}{dx}$', desc: 'Derivative notation' },
      ]
    },
    {
      category: 'Greek Letters',
      items: [
        { latex: '$\\\\alpha, \\\\beta, \\\\gamma$', desc: 'Lowercase' },
        { latex: '$\\\\Delta, \\\\Sigma, \\\\Omega$', desc: 'Uppercase' },
        { latex: '$\\\\pi, \\\\theta, \\\\phi$', desc: 'Common symbols' },
        { latex: '$\\\\lambda, \\\\mu, \\\\sigma$', desc: 'Statistics' },
      ]
    },
    {
      category: 'Operators',
      items: [
        { latex: '$\\\\sum_{i=1}^{n}$', desc: 'Summation' },
        { latex: '$\\\\int_{a}^{b}$', desc: 'Integral' },
        { latex: '$\\\\prod_{i=1}^{n}$', desc: 'Product' },
        { latex: '$\\\\lim_{x \\\\to \\\\infty}$', desc: 'Limit' },
      ]
    },
    {
      category: 'Matrices',
      items: [
        { latex: '$\\\\begin{pmatrix} a & b \\\\\\\\ c & d \\\\end{pmatrix}$', desc: '2×2 Matrix' },
        { latex: '$\\\\begin{bmatrix} 1 & 0 \\\\\\\\ 0 & 1 \\\\end{bmatrix}$', desc: 'Square brackets' },
      ]
    },
    {
      category: 'Relations',
      items: [
        { latex: '$\\\\leq, \\\\geq$', desc: 'Less/Greater or equal' },
        { latex: '$\\\\neq, \\\\approx$', desc: 'Not equal, approximately' },
        { latex: '$\\\\subset, \\\\supset$', desc: 'Subset, superset' },
        { latex: '$\\\\in, \\\\notin$', desc: 'Element of' },
      ]
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">LaTeX Math Guide</h2>
            <p className="text-sm text-gray-600 mt-1">Use these commands to display mathematical formulas</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white hover:shadow transition-all">
            <XIcon size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <h3 className="font-bold text-blue-900 mb-2">💡 Quick Tips:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use <code className="bg-blue-100 px-1 rounded">$...$</code> for inline math: $x + y$</li>
              <li>• Use <code className="bg-blue-100 px-1 rounded">$$...$$</code> for display math (centered on its own line)</li>
              <li>• In JSON, remember to <strong>double-escape backslashes</strong>: <code className="bg-blue-100 px-1 rounded">\\\\ → \\\\\\\\</code></li>
            </ul>
          </div>

          <div className="space-y-6">
            {examples.map((section) => (
              <div key={section.category} className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800 mb-3">{section.category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-gray-200 hover:border-purple-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-600 font-medium">{item.desc}</span>
                      </div>
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded block overflow-x-auto text-purple-700">
                        {item.latex}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <h3 className="font-bold text-green-900 mb-2">📚 Learn More:</h3>
            <p className="text-sm text-green-800">
              For a complete reference, visit:{' '}
              <a 
                href="https://katex.org/docs/supported.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-green-600"
              >
                KaTeX Supported Functions
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatexGuide;
