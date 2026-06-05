import React from "react";
import { CountdownTimer } from "../../src/components/CountdownTimer";

describe("CountdownTimer Component", () => {
  beforeEach(() => {
    cy.clock();
  });

  it("should render with 5 minutes", () => {
    const expiresAt = new Date(Date.now() + 300000).toISOString();
    cy.mount(<CountdownTimer expiresAt={expiresAt} />);

    cy.contains("Time remaining to complete checkout").should("be.visible");
    cy.contains("5:00").should("be.visible");
    cy.contains("Complete checkout before time expires").should("be.visible");
  });

  it("should count down from 2 minutes", () => {
    const expiresAt = new Date(Date.now() + 120000).toISOString();
    cy.mount(<CountdownTimer expiresAt={expiresAt} />);

    cy.contains("2:00").should("be.visible");

    cy.tick(30000);
    cy.contains("1:30").should("be.visible");

    cy.tick(30000);
    cy.contains("1:00").should("be.visible");
  });

  it("should update every second", () => {
    const expiresAt = new Date(Date.now() + 5000).toISOString();
    cy.mount(<CountdownTimer expiresAt={expiresAt} />);

    cy.contains("0:05").should("be.visible");

    cy.tick(1000);
    cy.contains("0:04").should("be.visible");

    cy.tick(1000);
    cy.contains("0:03").should("be.visible");
  });

  it("should show blue color when time > 60 seconds", () => {
    const expiresAt = new Date(Date.now() + 120000).toISOString();
    cy.mount(<CountdownTimer expiresAt={expiresAt} />);

    cy.get(".font-mono").should("have.class", "text-blue-700");
    cy.get(".font-mono").should("not.have.class", "text-orange-500");
    cy.get(".font-mono").should("not.have.class", "text-red-600");
  });

  it("should show orange color when time <= 60 seconds", () => {
    const expiresAt = new Date(Date.now() + 55000).toISOString();
    cy.mount(<CountdownTimer expiresAt={expiresAt} />);

    cy.get(".font-mono").should("have.class", "text-orange-500");
    cy.contains("Hurry! Reservation expiring soon!").should("be.visible");
  });

  it("should show red color and pulse when time <= 30 seconds", () => {
    const expiresAt = new Date(Date.now() + 25000).toISOString();
    cy.mount(<CountdownTimer expiresAt={expiresAt} />);

    cy.get(".font-mono").should("have.class", "text-red-600");
    cy.get(".font-mono").should("have.class", "animate-pulse");
  });

  it("should call onExpire when timer reaches zero", () => {
    const onExpire = cy.stub().as("onExpire");
    const expiresAt = new Date(Date.now() + 3000).toISOString();
    cy.mount(<CountdownTimer expiresAt={expiresAt} onExpire={onExpire} />);

    cy.tick(3000);
    cy.get("@onExpire").should("have.been.calledOnce");
  });

  it("should not render when expiresAt is null", () => {
    cy.mount(<CountdownTimer expiresAt={null} />);

    cy.get(".bg-blue-50").should("not.exist");
  });

  it("should not render when expiresAt is expired", () => {
    const expiresAt = new Date(Date.now() - 1000).toISOString();
    cy.mount(<CountdownTimer expiresAt={expiresAt} />);

    cy.get(".bg-blue-50").should("not.exist");
  });
});
