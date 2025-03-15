describe('user happy path', () => {
  it('navigate to home page successfully', () => {
    cy.visit('http://localhost:4000/');
    cy.url().should('include', 'localhost:4000');
  });

  it('should navigate to the register screen successfully', () => {
    cy.visit('http://localhost:4000/');
    cy.get('button[name="button-go-to-login"]')
      .click()
    cy.url().should('include', 'localhost:4000/login');
    cy.get('button[name="button-go-to-signup"]')
      .click()
    cy.url().should('include', 'localhost:4000/register');
  })

  // can uncomment once user can delete their account

  // it('invalid registration details and registering a user', () => {
  //   cy.visit('http://localhost:4000/');
  //   cy.get('button[name="button-go-to-login"]')
  //     .click()
  //   cy.get('button[name="button-go-to-signup"]')
  //     .click()
  //   cy.get('input[id="email"]')
  //     .focus()
  //     .type('email')
  //   cy.get('input[id="name"]')
  //     .focus()
  //     .type('name')
  //   cy.get('input[id="university"]')
  //     .focus()
  //     .type('UNSW')
  //   cy.get('input[id="password"]')
  //     .focus()
  //     .type('1234')
  //   cy.get('input[id="confirmPassword"]')
  //     .focus()
  //     .type('1234')
  //   // invalid email address
  //   cy.get('button[name="button-submit"]').should('be.disabled')
  //   cy.get('input[id="email"]')
  //     .focus()
  //     .type('@email')
  //   cy.get('button[name="button-submit"]').should('not.be.disabled')
  //   cy.get('input[id="password"]')
  //     .focus()
  //     .type('{backspace}')
  //   cy.get('input[id="confirmPassword"]')
  //     .focus()
  //     .type('{backspace}')
  //   // too short
  //   cy.get('button[name="button-submit"]').should('be.disabled')
  //   cy.get('input[id="password"]')
  //     .focus()
  //     .type('\'')
  //   cy.get('input[id="confirmPassword"]')
  //   .focus()
  //   .type('\'')
  //   // invalid character
  //   cy.get('button[name="button-submit"]').should('be.disabled')
  //   cy.get('input[id="password"]')
  //     .focus()
  //     .type('{backspace}a')
  //   cy.get('input[id="confirmPassword"]')
  //     .focus()
  //     .type('{backspace}a')
  //   cy.get('button[name="button-submit"]')
  //     .click()
  //   cy.url().should('include', 'localhost:4000/dash');
  // })

  it('should be able to log in and out successfully', () => {
    cy.visit('http://localhost:4000/');
    cy.get('button[name="button-go-to-login"]')
      .click()
    cy.get('input[id="email"]')
      .focus()
      .type('email@email')
    cy.get('input[id="password"]')
      .focus()
      .type('123a')
    cy.get('button[name="button-submit"]')
      .click()
    cy.url().should('include', 'localhost:4000/dash');
    cy.get('button[name="button-logout"]')
      .click()
    cy.url().should('not.include', 'localhost:4000/dash');
  });

  it('stay logged in', () => {
    cy.visit('http://localhost:4000/');
    cy.get('button[name="button-go-to-login"]')
      .click()
    cy.get('input[id="email"]')
      .focus()
      .type('email@email')
    cy.get('input[id="password"]')
      .focus()
      .type('123a')
    cy.get('button[name="button-submit"]')
      .click()
    cy.url().should('include', 'localhost:4000/dash');
    cy.reload()
    cy.url().should('include', 'localhost:4000/dash');
  })
});

