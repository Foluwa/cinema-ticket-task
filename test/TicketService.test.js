import TicketService from '../src/pairtest/TicketService.js';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js';

// Mock external services
class MockTicketPaymentService {
  makePayment(accountId, totalAmount) {
    console.log(`Mock payment made for account ${accountId}: £${totalAmount}`);
  }
}

class MockSeatReservationService {
  reserveSeat(accountId, totalSeats) {
    console.log(`Mock seat reservation for account ${accountId}: ${totalSeats} seats`);
  }
}

describe('TicketService', () => {
  let ticketService;

  beforeEach(() => {
    ticketService = new TicketService();
    ticketService.paymentService = new MockTicketPaymentService();
    ticketService.seatService = new MockSeatReservationService();
  });

  test('valid ticket purchase', () => {
    const accountId = 1;
    const adultRequest = new TicketTypeRequest('ADULT', 2);
    const childRequest = new TicketTypeRequest('CHILD', 1);
    const infantRequest = new TicketTypeRequest('INFANT', 1);

    ticketService.purchaseTickets(accountId, adultRequest, childRequest, infantRequest);

    expect(true).toBe(true); // Placeholder assertion
  });

  test('invalid account ID', () => {
    const invalidAccountId = 0;
    const adultRequest = new TicketTypeRequest('ADULT', 1);

    expect(() => {
      ticketService.purchaseTickets(invalidAccountId, adultRequest);
    }).toThrow(InvalidPurchaseException);
  });

  test('no tickets requested', () => {
    expect(() => {
      ticketService.purchaseTickets(1);
    }).toThrow(InvalidPurchaseException);
  });

  test('exceed max ticket limit', () => {
    const accountId = 1;
    const adultRequest = new TicketTypeRequest('ADULT', 26);

    expect(() => {
      ticketService.purchaseTickets(accountId, adultRequest);
    }).toThrow(InvalidPurchaseException);
  });

  test('child tickets without adult', () => {
    const accountId = 1;
    const childRequest = new TicketTypeRequest('CHILD', 1);

    expect(() => {
      ticketService.purchaseTickets(accountId, childRequest);
    }).toThrow(InvalidPurchaseException);
  });

  test('infant tickets without adult', () => {
    const accountId = 1;
    const infantRequest = new TicketTypeRequest('INFANT', 1);

    expect(() => {
      ticketService.purchaseTickets(accountId, infantRequest);
    }).toThrow(InvalidPurchaseException);
  });

  test('multiple ticket requests', () => {
    const accountId = 1;
    const adultRequest1 = new TicketTypeRequest('ADULT', 2);
    const adultRequest2 = new TicketTypeRequest('ADULT', 1);

    ticketService.purchaseTickets(accountId, adultRequest1, adultRequest2);

    expect(true).toBe(true); // Placeholder assertion
  });

  test('infant tickets exceeding adult tickets', () => {
    const accountId = 1;
    // 1 adult and 2 infants (infant tickets > adult tickets)
    const adultRequest = new TicketTypeRequest('ADULT', 1);
    const infantRequest = new TicketTypeRequest('INFANT', 2);

    expect(() => {
      ticketService.purchaseTickets(accountId, adultRequest, infantRequest);
    }).toThrow(InvalidPurchaseException);
  });
});
