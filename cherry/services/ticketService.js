import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TICKETS_FILE = path.join(__dirname, '../data/tickets.json');

// Ensure data directory exists
async function ensureDataDir() {
    const dataDir = path.join(__dirname, '../data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// Read tickets from file
async function readTickets() {
    try {
        await ensureDataDir();
        const data = await fs.readFile(TICKETS_FILE, 'utf8');
        return JSON.parse(data).tickets;
    } catch (error) {
        // If file doesn't exist, return empty array
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

// Write tickets to file
async function writeTickets(tickets) {
    await ensureDataDir();
    await fs.writeFile(TICKETS_FILE, JSON.stringify({ tickets }, null, 2));
}

// Get all tickets
export async function getAllTickets() {
    return await readTickets();
}

// Get tickets by user
export async function getTicketsByUser(userId) {
    const tickets = await readTickets();
    return tickets.filter(ticket => ticket.createdBy === userId);
}

// Create new ticket
export async function createTicket(ticketData) {
    const tickets = await readTickets();
    const newTicket = {
        id: Date.now().toString(),
        ...ticketData,
        createdAt: new Date().toISOString(),
        comments: [],
        attachments: []
    };
    tickets.push(newTicket);
    await writeTickets(tickets);
    return newTicket;
}

// Update ticket
export async function updateTicket(ticketId, updates) {
    const tickets = await readTickets();
    const index = tickets.findIndex(t => t.id === ticketId);
    if (index === -1) {
        throw new Error('Ticket not found');
    }
    tickets[index] = { ...tickets[index], ...updates };
    await writeTickets(tickets);
    return tickets[index];
}

// Delete ticket
export async function deleteTicket(ticketId) {
    const tickets = await readTickets();
    const filteredTickets = tickets.filter(t => t.id !== ticketId);
    await writeTickets(filteredTickets);
}

// Add comment to ticket
export async function addComment(ticketId, comment) {
    const tickets = await readTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
        throw new Error('Ticket not found');
    }
    ticket.comments = ticket.comments || [];
    ticket.comments.push({
        id: Date.now().toString(),
        ...comment,
        createdAt: new Date().toISOString()
    });
    await writeTickets(tickets);
    return ticket;
}

// Get ticket by id
export async function getTicketById(ticketId) {
    const tickets = await readTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
        throw new Error('Ticket not found');
    }
    return ticket;
}

// Filter tickets
export async function filterTickets({ status, priority, category, search }) {
    let tickets = await readTickets();
    
    if (status) {
        tickets = tickets.filter(t => t.status === status);
    }
    if (priority) {
        tickets = tickets.filter(t => t.priority === priority);
    }
    if (category) {
        tickets = tickets.filter(t => t.category === category);
    }
    if (search) {
        const searchLower = search.toLowerCase();
        tickets = tickets.filter(t => 
            t.title.toLowerCase().includes(searchLower) ||
            t.description.toLowerCase().includes(searchLower)
        );
    }
    
    return tickets;
}
