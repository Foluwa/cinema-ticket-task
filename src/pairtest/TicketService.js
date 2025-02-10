import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';

const parseIntegerEnv = (key, defaultValue) => { 
  const parsed = parseInt(process.env[key], 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

const TICKET_PRICES = {
  ADULT: parseIntegerEnv('ADULT_TICKET_PRICE', 25),
  CHILD: parseIntegerEnv('CHILD_TICKET_PRICE', 15),
  INFANT: parseIntegerEnv('INFANT_TICKET_PRICE', 0),
};


// const MAX_TICKETS = parseIntegerEnv(key, 25);
const MAX_TICKETS = parseIntegerEnv('MAX_TICKETS', 25);
const ALLOWED_TICKET_TYPES = ['ADULT', 'CHILD', 'INFANT'];


export default class TicketService {
  #paymentService;
  #seatService;

  constructor() {
    this.#paymentService = new TicketPaymentService();
    this.#seatService = new SeatReservationService();
  }

  /**
   * Should only have private methods other than the one below.
   */


  /**
   * Public method to purchase tickets.
   */
    purchaseTickets(accountId, ...ticketTypeRequests) {
      this.#validateAccountId(accountId);
      this.#validateTicketTypeRequests(ticketTypeRequests);
  
      const ticketCounts = this.#countTicketsByType(ticketTypeRequests);
      this.#validatePurchaseRules(ticketCounts);
  
      const totalAmount = this.#calculateTotalPrice(ticketCounts);
      const totalSeats = this.#calculateTotalSeats(ticketCounts);
  
      this.#paymentService.makePayment(accountId, totalAmount); 
      this.#seatService.reserveSeat(accountId, totalSeats);
    }

  /**
   * Private method to validate account ID.
   */
  #validateAccountId(accountId) {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new InvalidPurchaseException('Invalid account ID');
    }
  }

  /**
   * Private method to validate ticket type requests.
   */
  #validateTicketTypeRequests(ticketTypeRequests) {
    if (!ticketTypeRequests || ticketTypeRequests.length === 0) {
      throw new InvalidPurchaseException('No tickets requested');
    }

    ticketTypeRequests.forEach(request => {
      if (!(request instanceof TicketTypeRequest)) {
        throw new InvalidPurchaseException('Ticket request must be an instance of TicketTypeRequest');
      }
      if (!ALLOWED_TICKET_TYPES.includes(request.getTicketType())) {
        throw new InvalidPurchaseException(`Invalid ticket type: ${request.getTicketType()}`);
      }
      if (request.getNoOfTickets() <= 0) {
        throw new InvalidPurchaseException('Number of tickets must be a positive integer');
      }
    });
  }

  /**
   * Private method to count tickets by type.
   */
  #countTicketsByType(ticketTypeRequests) {
    const ticketCounts = {
      ADULT: 0,
      CHILD: 0,
      INFANT: 0
    };

    ticketTypeRequests.forEach(request => {
      ticketCounts[request.getTicketType()] += request.getNoOfTickets();
    });

    return ticketCounts;
  }

  /**
   * Private method to validate purchase rules.
   */
  #validatePurchaseRules(ticketCounts) {
    const totalTickets = ticketCounts.ADULT + ticketCounts.CHILD + ticketCounts.INFANT;

    if (totalTickets === 0) {
      throw new InvalidPurchaseException('At least one ticket must be purchased');
    }

    if (totalTickets > MAX_TICKETS) {
      throw new InvalidPurchaseException(`Maximum ${MAX_TICKETS} tickets per purchase`);
    }

    if (ticketCounts.ADULT === 0 && (ticketCounts.CHILD > 0 || ticketCounts.INFANT > 0)) {
      throw new InvalidPurchaseException('Child and infant tickets require at least one adult ticket');
    }

    if (ticketCounts.INFANT > ticketCounts.ADULT) {
      throw new InvalidPurchaseException('Infant tickets cannot exceed adult tickets');
    }
  }

  /**
   * Private method to calculate the total amount.
   */
  #calculateTotalPrice(ticketCounts) {
    return Object.entries(ticketCounts).reduce((total, [type, count]) => {
      return total + (TICKET_PRICES[type] * count);
    }, 0);
  }

  /**
   * Private method to calculate the total seats.
   */
  #calculateTotalSeats(ticketCounts) {
    return ticketCounts.ADULT + ticketCounts.CHILD;
  }
}
