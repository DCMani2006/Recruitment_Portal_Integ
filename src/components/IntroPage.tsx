"use client";

import React from "react";
import { DomainPage } from "./DomainPage";
import { DOMAIN_PAGES_DATA } from "@/content/domainPagesData";

interface IntroPageProps {
  isVisible?: boolean;
}

export function IntroPage({ isVisible = true }: IntroPageProps) {
  const editorialData = DOMAIN_PAGES_DATA.find((d) => d.domainCode === "EDITORIAL");
  return <DomainPage data={editorialData} isVisible={isVisible} />;
}
