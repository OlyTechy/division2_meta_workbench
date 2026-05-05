import React, { useState, useEffect, useCallback } from 'react';
import './TitleBar.css';
import { MdStorage, MdChat, MdTune } from 'react-icons/md';
import { FaGithub } from 'react-icons/fa';
import LoadModal from './LoadModal';
import DivisionDBModal from './DivisionDBModal';
import ChatWindow from './ChatWindow';
import AdjustmentModifiersOverlay from './AdjustmentModifiersOverlay';
import VersionCheck from './VersionCheck';
import { useDataFreshnessStore } from '../stores/useDataFreshnessStore';
import { useBackButtonClose } from '../hooks/useBackButtonClose';

interface TitleBarProps {
  onLoadData: (dataType: string, pageName: string, isCSV?: boolean) => Promise<void>;
}

function TitleBar({ onLoadData }: TitleBarProps) {
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [isDBModalOpen, setIsDBModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAdjustmentsOpen, setIsAdjustmentsOpen] = useState(false);

  const staleCount = useDataFreshnessStore((s) => s.staleKeys.size);
  const checkFreshness = useDataFreshnessStore((s) => s.checkFreshness);

  const closeChat = useCallback(() => setIsChatOpen(false), []);
  useBackButtonClose(isChatOpen, closeChat);

  // Check freshness on mount and every 5 minutes
  useEffect(() => {
    // Small delay so clean data store finishes loading first
    const initial = setTimeout(() => checkFreshness(), 5000);
    const interval = setInterval(() => checkFreshness(), 5 * 60 * 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [checkFreshness]);

  return (
    <>
      <div className="title-bar">
        <h1 className="title">Division 2 Meta Workbench</h1>
        <VersionCheck />
        <div className="action-buttons">
          <a
            className="icon-button"
            href="https://github.com/olytechy/division2_meta_workbench"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub Repository"
          >
            <FaGithub />
          </a>
          <button className="icon-button" onClick={() => setIsChatOpen(true)} title="Chat">
            <MdChat />
          </button>
          <button
            className="icon-button"
            onClick={() => setIsAdjustmentsOpen(true)}
            title="Adjustment Modifiers"
          >
            <MdTune />
          </button>
          <button
            className={`icon-button${staleCount > 0 ? ' db-stale' : ''}`}
            onClick={() => setIsDBModalOpen(true)}
            title={
              staleCount > 0 ? `DivisionDB — ${staleCount} table(s) have updates` : 'DivisionDB'
            }
          >
            <MdStorage />
            {staleCount > 0 && <span className="db-badge">{staleCount}</span>}
          </button>
          {/* <button onClick={() => setIsLoadModalOpen(true)}>Load</button> */}
        </div>
      </div>
      {isChatOpen && (
        <div className="chat-overlay" onClick={() => setIsChatOpen(false)}>
          <div className="chat-overlay-window" onClick={(e) => e.stopPropagation()}>
            <button
              className="mobile-back-btn"
              onClick={() => setIsChatOpen(false)}
              aria-label="Close"
            >
              ← Back
            </button>
            <ChatWindow />
          </div>
        </div>
      )}
      <DivisionDBModal isOpen={isDBModalOpen} onClose={() => setIsDBModalOpen(false)} />
      <AdjustmentModifiersOverlay
        isOpen={isAdjustmentsOpen}
        onClose={() => setIsAdjustmentsOpen(false)}
      />
      <LoadModal
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
        onLoadData={onLoadData}
      />
    </>
  );
}

export default TitleBar;
