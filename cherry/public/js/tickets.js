let currentUser = null;
let isAdmin = false;

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        currentUser = data;
        isAdmin = data.isAdmin;
        
        // Set up event listeners
        setupFilters();
        loadTickets();
        
        // Set up form submission
        document.getElementById('newTicketForm').addEventListener('submit', handleNewTicket);
    } catch (error) {
        console.error('Error initializing page:', error);
    }
});

// Set up filter event listeners
function setupFilters() {
    const filters = ['statusFilter', 'priorityFilter', 'categoryFilter'];
    filters.forEach(filter => {
        document.getElementById(filter).addEventListener('change', loadTickets);
    });
    
    document.getElementById('searchTickets').addEventListener('input', debounce(loadTickets, 300));
}

// Load tickets based on filters
async function loadTickets() {
    try {
        const status = document.getElementById('statusFilter').value;
        const priority = document.getElementById('priorityFilter').value;
        const category = document.getElementById('categoryFilter').value;
        const search = document.getElementById('searchTickets').value;

        let url = isAdmin ? '/api/tickets/admin' : '/api/tickets/my-tickets';
        url += `?status=${status}&priority=${priority}&category=${category}&search=${search}`;

        const response = await fetch(url);
        const tickets = await response.json();

        displayTickets(tickets);
    } catch (error) {
        console.error('Error loading tickets:', error);
        showError('Failed to load tickets');
    }
}

// Display tickets in the list
function displayTickets(tickets) {
    const ticketsList = document.getElementById('ticketsList');
    ticketsList.innerHTML = '';

    tickets.forEach(ticket => {
        const ticketElement = createTicketElement(ticket);
        ticketsList.appendChild(ticketElement);
    });
}

// Create a ticket element
function createTicketElement(ticket) {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow';
    div.innerHTML = `
        <div class="flex justify-between items-start">
            <div>
                <h3 class="text-lg font-semibold">${escapeHtml(ticket.title)}</h3>
                <p class="text-sm text-gray-600">Created by: ${escapeHtml(ticket.createdBy.name)}</p>
            </div>
            <div class="flex space-x-2">
                <span class="px-2 py-1 rounded text-sm ${getStatusClass(ticket.status)}">${ticket.status}</span>
                <span class="px-2 py-1 rounded text-sm ${getPriorityClass(ticket.priority)}">${ticket.priority}</span>
            </div>
        </div>
        <p class="mt-2 text-gray-700">${escapeHtml(ticket.description.substring(0, 150))}${ticket.description.length > 150 ? '...' : ''}</p>
        <div class="mt-2 text-sm text-gray-500">
            <span>${new Date(ticket.createdAt).toLocaleDateString()}</span>
            <span class="mx-2">•</span>
            <span>${ticket.category}</span>
        </div>
    `;

    div.addEventListener('click', () => showTicketDetail(ticket._id));
    return div;
}

// Handle new ticket submission
async function handleNewTicket(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const response = await fetch('/api/tickets', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Failed to create ticket');

        closeNewTicketModal();
        loadTickets();
        showSuccess('Ticket created successfully');
    } catch (error) {
        console.error('Error creating ticket:', error);
        showError('Failed to create ticket');
    }
}

// Show ticket detail
async function showTicketDetail(ticketId) {
    try {
        const response = await fetch(`/api/tickets/${ticketId}`);
        const ticket = await response.json();

        const modal = document.getElementById('ticketDetailModal');
        const content = document.getElementById('ticketDetailContent');

        content.innerHTML = `
            <h2 class="text-2xl font-bold mb-4">${escapeHtml(ticket.title)}</h2>
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p class="text-sm text-gray-600">Status: 
                        ${isAdmin ? createStatusSelect(ticket.status) : `<span class="${getStatusClass(ticket.status)}">${ticket.status}</span>`}
                    </p>
                    <p class="text-sm text-gray-600">Priority: 
                        ${isAdmin ? createPrioritySelect(ticket.priority) : `<span class="${getPriorityClass(ticket.priority)}">${ticket.priority}</span>`}
                    </p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Created by: ${escapeHtml(ticket.createdBy.name)}</p>
                    <p class="text-sm text-gray-600">Created: ${new Date(ticket.createdAt).toLocaleString()}</p>
                </div>
            </div>
            <div class="mb-4">
                <h3 class="font-semibold mb-2">Description</h3>
                <p class="text-gray-700">${escapeHtml(ticket.description)}</p>
            </div>
            ${ticket.attachments.length ? createAttachmentsList(ticket.attachments) : ''}
            <div class="mt-4">
                <h3 class="font-semibold mb-2">Comments</h3>
                <div class="space-y-4" id="commentsList">
                    ${createCommentsList(ticket.comments)}
                </div>
                <form id="commentForm" class="mt-4">
                    <textarea name="content" required class="w-full border rounded p-2" placeholder="Add a comment..."></textarea>
                    <button type="submit" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Add Comment
                    </button>
                </form>
            </div>
        `;

        if (isAdmin) {
            setupAdminControls(ticket._id);
        }

        setupCommentForm(ticket._id);
        modal.classList.remove('hidden');
    } catch (error) {
        console.error('Error showing ticket detail:', error);
        showError('Failed to load ticket details');
    }
}

// Utility functions
function getStatusClass(status) {
    const classes = {
        'open': 'bg-green-100 text-green-800',
        'in-progress': 'bg-blue-100 text-blue-800',
        'resolved': 'bg-gray-100 text-gray-800',
        'closed': 'bg-red-100 text-red-800'
    };
    return classes[status] || '';
}

function getPriorityClass(priority) {
    const classes = {
        'low': 'bg-gray-100 text-gray-800',
        'medium': 'bg-yellow-100 text-yellow-800',
        'high': 'bg-orange-100 text-orange-800',
        'urgent': 'bg-red-100 text-red-800'
    };
    return classes[priority] || '';
}

function createStatusSelect(currentStatus) {
    return `
        <select class="status-select border rounded p-1">
            <option value="open" ${currentStatus === 'open' ? 'selected' : ''}>Open</option>
            <option value="in-progress" ${currentStatus === 'in-progress' ? 'selected' : ''}>In Progress</option>
            <option value="resolved" ${currentStatus === 'resolved' ? 'selected' : ''}>Resolved</option>
            <option value="closed" ${currentStatus === 'closed' ? 'selected' : ''}>Closed</option>
        </select>
    `;
}

function createPrioritySelect(currentPriority) {
    return `
        <select class="priority-select border rounded p-1">
            <option value="low" ${currentPriority === 'low' ? 'selected' : ''}>Low</option>
            <option value="medium" ${currentPriority === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="high" ${currentPriority === 'high' ? 'selected' : ''}>High</option>
            <option value="urgent" ${currentPriority === 'urgent' ? 'selected' : ''}>Urgent</option>
        </select>
    `;
}

function createAttachmentsList(attachments) {
    return `
        <div class="mb-4">
            <h3 class="font-semibold mb-2">Attachments</h3>
            <ul class="list-disc pl-4">
                ${attachments.map(att => `
                    <li>
                        <a href="/uploads/tickets/${att.filename}" target="_blank" class="text-blue-500 hover:underline">
                            ${escapeHtml(att.filename)}
                        </a>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

function createCommentsList(comments) {
    return comments.map(comment => `
        <div class="bg-gray-50 p-3 rounded">
            <div class="flex justify-between items-start">
                <p class="font-semibold">${escapeHtml(comment.author.name)}</p>
                <span class="text-sm text-gray-500">${new Date(comment.createdAt).toLocaleString()}</span>
            </div>
            <p class="mt-1">${escapeHtml(comment.content)}</p>
        </div>
    `).join('');
}

function setupAdminControls(ticketId) {
    const statusSelect = document.querySelector('.status-select');
    const prioritySelect = document.querySelector('.priority-select');

    if (statusSelect) {
        statusSelect.addEventListener('change', async (e) => {
            await updateTicket(ticketId, { status: e.target.value });
        });
    }

    if (prioritySelect) {
        prioritySelect.addEventListener('change', async (e) => {
            await updateTicket(ticketId, { priority: e.target.value });
        });
    }
}

async function updateTicket(ticketId, updates) {
    try {
        const response = await fetch(`/api/tickets/${ticketId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) throw new Error('Failed to update ticket');
        
        showSuccess('Ticket updated successfully');
        loadTickets();
    } catch (error) {
        console.error('Error updating ticket:', error);
        showError('Failed to update ticket');
    }
}

function setupCommentForm(ticketId) {
    const form = document.getElementById('commentForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const content = form.content.value;
            const response = await fetch(`/api/tickets/${ticketId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });

            if (!response.ok) throw new Error('Failed to add comment');

            form.reset();
            showTicketDetail(ticketId);
            showSuccess('Comment added successfully');
        } catch (error) {
            console.error('Error adding comment:', error);
            showError('Failed to add comment');
        }
    });
}

// Modal controls
function openNewTicketModal() {
    document.getElementById('newTicketModal').classList.remove('hidden');
}

function closeNewTicketModal() {
    document.getElementById('newTicketModal').classList.add('hidden');
    document.getElementById('newTicketForm').reset();
}

function closeTicketDetailModal() {
    document.getElementById('ticketDetailModal').classList.add('hidden');
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showSuccess(message) {
    // Implement your preferred notification system
    alert(message);
}

function showError(message) {
    // Implement your preferred notification system
    alert(message);
}
