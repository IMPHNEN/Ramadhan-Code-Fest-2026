import React from "react";

let tags: React.ReactNode[] = [];

export const Head = ({ children }: { children: React.ReactNode }) => {
  tags.push(children);
  return null;
};

export function flushHead() {
  const collected = [...tags];
  tags = [];
  return collected;
}
