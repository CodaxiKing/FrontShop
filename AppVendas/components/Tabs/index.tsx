import React, { useState } from 'react';
import {
  TabsContainer,
  TabButton,
  TabText,
  ContentContainer,
} from './style';

interface Tab {
  key: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  initialTab?: string;
  onTabChange?: (activeTab: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, initialTab, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0].key);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (onTabChange) {
      onTabChange(key);
    }
  };

  const activeContent = tabs.find((tab) => tab.key === activeTab)?.content;

  return (
    <>
      <TabsContainer>
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            active={tab.key === activeTab}
            onPress={() => handleTabChange(tab.key)}
          >
            <TabText active={tab.key === activeTab}>{tab.label}</TabText>
          </TabButton>
        ))}
      </TabsContainer>
      <ContentContainer>{activeContent}</ContentContainer>
    </>
  );
};

export default Tabs;
