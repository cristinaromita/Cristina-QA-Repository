
Feature: Login and Marta chat

	Scenario: Marta chat interface - visual regression
		Given I am on the login page
		And I enter access key ""
		And I click the submit button
		And I click the login button
		And I enter username ""
		And I enter password ""
		And I click the Sign in button
		When I click the icon labeled "Marta"
		And I accept only necessary cookies
		When I click the Got it button 
	    And I capture and compare snapshot "marta-chat-interface-expanded"
		And I click on the right panel accordion
        And I capture and compare snapshot "marta-chat-interface-collapsed"

	Scenario: Token usage when specific prompts are used in chat
		Given I am on the login page
		And I enter access key ""
		And I click the submit button
		And I click the login button
		And I enter username ""
		And I enter password ""
		And I click the Sign in button
		When I click the icon labeled "Marta"
		And I accept only necessary cookies
		When I click the Got it button
		And I click on the message input field
		And I type "How are you today?" in the message input
		And I capture and compare snapshot "chat-no-token-request"
		And I clear the message input field
		And I type "Show me" in the message input
		And I capture and compare snapshot "chat-token-request"