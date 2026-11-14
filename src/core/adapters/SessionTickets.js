export class SessionTickets {
 #lease;#generation=0;#operations=new Set();
 constructor({lease}){if(typeof lease?.ticket!=='function'||typeof lease?.verify!=='function')throw TypeError('StorySessionLease required');this.#lease=lease;}
 invalidate(){this.#generation++;this.#operations.clear();}
 issue(){const leaseTicket=this.#lease.ticket();if(!leaseTicket||!this.#lease.verify(leaseTicket))return null;const ticket=Object.freeze({leaseTicket,epoch:this.#generation,operationId:leaseTicket.operationId});this.#operations.add(ticket);return ticket;}
 verify(ticket){return !!ticket && ticket.epoch===this.#generation && this.#operations.has(ticket) && this.#lease.verify(ticket.leaseTicket);}
 verifyRebind(ticket){return !!ticket&&ticket.epoch===this.#generation&&this.#operations.has(ticket)&&this.#lease.verifyRebind(ticket.leaseTicket);}
 complete(ticket){this.#operations.delete(ticket);}
}
