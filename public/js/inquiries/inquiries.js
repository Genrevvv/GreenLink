import { getCurrentUser } from '../utils/user.js';
import { 
    inquiriesData,
    userInquiriesData
} from './inquiries-data.js';
import { 
    updateSummaryCards, 
    renderInquiryRows, 
    renderInquiryDetails, 
    setupInquiryForm, 
    renderPreviousInquiries
} from './inquiries-functions.js'

let inquiries = [];
let selectedId = null;
let myInquiries = []; 

export function initInquiries() {
    const user = getCurrentUser();

    if (user.user_type === 'admin') {
        adminInquiriesScript();
    }
    else if (user.user_type === 'user') {
        initUserInquiries();
    }

    console.log('inquiries.js has been imported');
}

function adminInquiriesScript() {
    inquiries = inquiriesData.map(inquiry => ({ ...inquiry }));
    selectedId = null;

    renderPage(inquiries, selectedId);
}

function initUserInquiries() {
    myInquiries = userInquiriesData.map(inquiry => ({ ...inquiry }));

    setupInquiryForm(myInquiries);
    renderPreviousInquiries(myInquiries);
}

function renderPage(inquiries, selectedId) {
    updateSummaryCards(inquiries);
    renderInquiryRows(inquiries, selectedId);
    renderInquiryDetails(inquiries, selectedId);
}



