import TicketService from '../src/pairtest/TicketService.js';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js';

describe('TicketService', () => {
    let ticketService;

    beforeEach(() => {
        ticketService = new TicketService();
    });

    it('should return ticket purchase successfully', () => {
        const accountId = 1;
        const adultRequest = new TicketTypeRequest('ADULT', 2);
        const childRequest = new TicketTypeRequest('CHILD', 1);
        const infantRequest = new TicketTypeRequest('INFANT', 1);

        const result = ticketService.purchaseTickets(accountId, adultRequest, childRequest, infantRequest);

        expect(result).toMatchObject({
            status: 'success',
            message: 'Tickets purchased successfully',
            accountId: 1,
            totalAmount: 65,
            totalSeats: 3,
            ticketCounts: { ADULT: 2, CHILD: 1, INFANT: 1 }
        });
    });

    it('should throw an error when ticket count is less than 0', () => {
        const accountId = 1;
        const adultRequest = new TicketTypeRequest('ADULT', 0);
        const childRequest = new TicketTypeRequest('CHILD', 0);
        const infantRequest = new TicketTypeRequest('INFANT', 0);

        expect(() => {
            ticketService.purchaseTickets(accountId, adultRequest, childRequest, infantRequest);
        }).toThrow('At least one ticket must be purchased');
    });


    it('should throw an error when account ID is invalid', () => {
        const invalidAccountId = 0;
        const adultRequest = new TicketTypeRequest('ADULT', 1);

        expect(() => {
            ticketService.purchaseTickets(invalidAccountId, adultRequest);
        }).toThrow(InvalidPurchaseException);
    });

    it('should throw error when user exceed max ticket limit', () => {
        const accountId = 1;
        const adultRequest = new TicketTypeRequest('ADULT', 26);

        expect(() => {
            ticketService.purchaseTickets(accountId, adultRequest)
        }).toThrow('Maximum 25 tickets per purchase');
    });

    it('should throw an error when child ticket is purchased without adult', () => {
        const accountId = 1;
        const childRequest = new TicketTypeRequest('CHILD', 1);

        expect(() => {
            ticketService.purchaseTickets(accountId, childRequest);
        }).toThrow('Child and infant tickets require at least one adult ticket');
    });

    it('should throw an error when infant tickets is purchased without adult', () => {
        const accountId = 1;
        const infantRequest = new TicketTypeRequest('INFANT', 1);

        expect(() => {
            ticketService.purchaseTickets(accountId, infantRequest);
        }).toThrow('Child and infant tickets require at least one adult ticket');
    });

    it('infant tickets exceeding adult tickets', () => {
        const accountId = 1;
        // 1 adult and 2 infants (infant tickets > adult tickets)
        const adultRequest = new TicketTypeRequest('ADULT', 1);
        const infantRequest = new TicketTypeRequest('INFANT', 2);

        expect(() => {
            ticketService.purchaseTickets(accountId, adultRequest, infantRequest);
        }).toThrow('Infant tickets cannot exceed adult tickets'); 
    });
});
