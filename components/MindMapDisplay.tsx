import React, { useState } from 'react';
import { MindMapNode } from '../services/geminiService';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface NodeProps {
  node: MindMapNode;
  isEditable: boolean;
  isRoot?: boolean;
}

const MindMapNodeComponent: React.FC<NodeProps> = ({ node, isEditable, isRoot = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const toggleExpand = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <li className="relative">
      <div 
        className="flex items-start gap-1 group"
      >
        {!isRoot && (
           <div className="flex-shrink-0 h-10 flex items-center">
             {hasChildren ? (
                <ChevronRightIcon 
                  className={`h-5 w-5 text-amber-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'} cursor-pointer`}
                  onClick={toggleExpand}
                />
             ) : (
                <div className="w-5 h-5" /> // Placeholder for alignment
             )}
           </div>
        )}
        <div
          className={`inline-block p-2 rounded-lg ${hasChildren && !isRoot ? 'cursor-pointer' : ''} ${isRoot ? 'bg-amber-600 text-white text-lg' : 'bg-amber-100 text-amber-900'} font-bold group-hover:bg-amber-200`}
          contentEditable={isEditable}
          suppressContentEditableWarning={true}
          onClick={(e) => {
            if (isEditable) e.stopPropagation();
            else if(!isRoot) toggleExpand();
          }}
        >
          {node.title}
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div className="pt-2">
          <ul className="mind-map-list space-y-1">
            {node.children?.map((child, index) => (
              <MindMapNodeComponent key={index} node={child} isEditable={isEditable} />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};


const MindMapDisplay: React.FC<{ node: MindMapNode; isEditable: boolean }> = ({ node, isEditable }) => {
  return (
    <>
      <ul className="mind-map-list space-y-2">
        <MindMapNodeComponent node={node} isEditable={isEditable} isRoot={true}/>
      </ul>
      <style>{`
        .mind-map-list {
          list-style: none;
          padding-left: 20px;
          position: relative;
        }
        .mind-map-list > li {
          position: relative;
        }
        /* Vertical line connecting siblings */
        .mind-map-list > li::before {
          content: '';
          position: absolute;
          top: 0;
          left: -10px; /* Align with chevron center */
          height: 100%;
          width: 2px;
          background-color: #fbbf24;
        }
        /* Shorten vertical line for the last child */
        .mind-map-list > li:last-child::before {
          height: 20px; /* Adjust to connect to the node's horizontal line */
        }
        /* Horizontal line connecting node to vertical line */
        .mind-map-list > li > div:first-child::before {
          content: '';
          position: absolute;
          top: 20px; /* Adjust to be vertically centered with chevron */
          left: -10px;
          width: 10px;
          height: 2px;
          background-color: #fbbf24;
        }
        /* Root element should not have lines */
        .mind-map-list:first-child > li::before,
        .mind-map-list:first-child > li > div:first-child::before {
            display: none;
        }
      `}</style>
    </>
  );
};


export default MindMapDisplay;