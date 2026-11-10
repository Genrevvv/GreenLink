import { escapeHtml } from '../utils/string.js';
import { createNotificationElement } from '../utils/notification/notification.js';
import { showOverlay, hideOverlay } from '../utils/overlay.js';
import * as api from './api.js';

// REPLY DIALOG
export function showReplyDialog(inquiry, onReplied) {
    showOverlay(`
        <div class="inquiry-dialog flex-column gap-4" role="dialog" aria-modal="true" aria-labelledby="inquiry-dialog-title">
            <button type="button" class="inquiry-dialog-close close-overlay" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
            </button>

            <h3 class="inquiry-dialog-title" id="inquiry-dialog-title">Reply to: ${escapeHtml(inquiry.subject)}</h3>

            <div class="inquiry-info-box">
                <p class="inquiry-info-label">Customer</p>
                <p class="inquiry-info-value">${escapeHtml(inquiry.customer)}</p>
            </div>

            <div class="inquiry-info-box">
                <p class="inquiry-info-label">Original Message</p>
                <p class="inquiry-info-text">${escapeHtml(inquiry.message)}</p>
            </div>

            <div class="flex-column gap-2">
                <label for="inquiry-reply-text" class="inquiry-dialog-label">Your Reply</label>
                <textarea id="inquiry-reply-text" class="inquiry-input inquiry-textarea" rows="6"
                    placeholder="Type your response here...">${escapeHtml(inquiry.response)}</textarea>
            </div>

            <button type="button" class="inquiry-primary-btn flex-center gap-2" id="inquiry-send-reply">
                <i class="fa-solid fa-reply"></i> Send Reply
            </button>
        </div>
    `);

    const textarea = document.querySelector('#inquiry-reply-text');
    textarea.focus();

    document.querySelector('#inquiry-send-reply').onclick = async () => {
        const reply = textarea.value.trim();

        if (!reply) {
            createNotificationElement({ status: 'failed', message: 'Please enter a reply message' });
            return;
        }

        const success = await api.replyInquiry(inquiry.id, reply);

        if (!success) {
            createNotificationElement({ status: 'failed', message: 'Failed to send reply' });
            return;
        }

        inquiry.status = 'Responded';
        inquiry.response = reply;

        hideOverlay();
        onReplied();
        createNotificationElement({ status: 'success', message: 'Reply sent successfully' });
    };
}
