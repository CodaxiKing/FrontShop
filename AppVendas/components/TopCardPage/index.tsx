import React from "react";
import { ContainerTopPageCard, TextTopPageCard } from "./style";

interface TopPageProps {
  textTopCard?: string;
}

const TopCardPage = ({ textTopCard }:TopPageProps) => {
  return (
    <ContainerTopPageCard>
      <TextTopPageCard>{textTopCard}</TextTopPageCard>
    </ContainerTopPageCard>
  );
};

export default TopCardPage;