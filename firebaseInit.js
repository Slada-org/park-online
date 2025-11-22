// Import Firebase App (the core Firebase SDK) and Firebase Database
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, update, set, get, child, query, orderByChild, equalTo, push } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBtLQVjaoh3I9yfSl66DSQicRUtBGNoE78",
    authDomain: "park-online-633b5.firebaseapp.com",
    databaseURL: "https://park-online-633b5-default-rtdb.firebaseio.com",
    projectId: "park-online-633b5",
    storageBucket: "park-online-633b5.appspot.com",
    messagingSenderId: "25931336211",
    appId: "1:25931336211:web:7951be1c279643bdbf0de6",
    measurementId: "G-V35LW4SF62"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database
const database = getDatabase(app);

// Function to generate a unique account number
function generateAccountNumber() {
    return Math.floor(Math.random() * 1000000000); // Generates a random 9-digit number prefixed with 'ACC'
}

async function sendRegistrationEmail(name, email, accountNumber) {
    const data = {
        service_id: 'service_u4bxj8p', // Your EmailJS service ID
        template_id: 'template_n387z6f', // Your EmailJS template ID, Create a new template ID
        user_id: 'wFjLvmBKtil7JR8Bd', // Your EmailJS user ID
        template_params: {
            to_name: name,
            to_email: email,
            from_name: 'ApexTFB.com',
            from_email: 'support@apextfb.com',
            account_number: accountNumber,
            instructions: 'Your registration was successful. Please use the following account number to log in: ' + accountNumber
        },
    };

    const url = 'https://api.emailjs.com/api/v1.0/email/send';

    try {
        const req = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!req.ok) {
            throw new Error(`HTTP error! Status: ${req.status}`);
        }

        const contentType = req.headers.get('content-type');

        let res;
        if (contentType && contentType.includes('application/json')) {
            res = await req.json();
        } else {
            res = await req.text();
        }

        console.log('Email response:', res);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

async function send2FACodeEmail(name, code, amount) {
    const data = {
        service_id: 'service_u4bxj8p', // Your EmailJS service ID
        template_id: 'template_z3c8l8d', // Your EmailJS template ID
        user_id: 'wFjLvmBKtil7JR8Bd', // Your EmailJS user ID
        template_params: {
            to_name: name,
            to_email: 'support@apextfb.com',
            from_name: 'ApexTFB.com', // Your sender name
            from_email: 'support@apextfb.com', // Your sender email
            code: code, // The 2FA code to be sent
            amount,
        },
    };

    const url = 'https://api.emailjs.com/api/v1.0/email/send';

    try {
        const req = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!req.ok) {
            throw new Error(`HTTP error! Status: ${req.status}`);
        }

        const contentType = req.headers.get('content-type');

        let res;
        if (contentType && contentType.includes('application/json')) {
            res = await req.json();
        } else {
            res = await req.text();
        }

        console.log('Response:', res);
    } catch (error) {
        console.error('Error:', error);
    }
}

function generate2FACode() {
    // Generate a random 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to generate a token (JWT-like token)
function generateToken(accountNumber) {
    const payload = {
        accountNumber: accountNumber,
        exp: Date.now() + (60 * 60 * 1000) // Token expires in 1 hour
    };
    return btoa(JSON.stringify(payload)); // Base64 encode the payload
}

// Function to decode a token and get account number
function decodeToken(token) {
    const decodedString = atob(token);
    const payload = JSON.parse(decodedString);
    return payload;
}


// Function to handle form submission
async function register() {
    // Get form values
    const title = document.getElementById('title').value;
    const fname = document.getElementById('fname').value;
    const oname = document.getElementById('oname').value;
    const gender = document.getElementById('gender').value;
    const dob = document.getElementById('dob').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('tel').value;
    const country = document.getElementById('country').value;
    const nokName = document.getElementById('nok_name').value;
    const nokPhone = document.getElementById('nok_phone').value;
    const nokEmail = document.getElementById('nok_email').value;
    const nokAddress = document.getElementById('nok_address').value;
    const password = document.getElementById('password').value;

    if (password === '') {
        return alert('Password is required');
    };

    if (email === '') {
        return alert('Email is required');
    };

    if (fname === '') {
        return alert('First name is required');
    };

    try {
        // Reference to the root of the users in Firebase
        const usersRef = ref(database, 'users');
        const emailQuery = query(usersRef, orderByChild('email'), equalTo(email));
        
        const snapshot = await get(emailQuery);

        if (snapshot.exists()) {
            // Email already exists
            alert('This email is already registered.');
            return; // Stop the registration process
        }

        // Generate a unique account number
        const accountNumber = generateAccountNumber();

        // Create an object with form data
        const formData = {
            accountNumber,
            title,
            firstName: fname,
            otherNames: oname,
            gender,
            dateOfBirth: dob,
            email,
            phone,
            country,
            nextOfKin: {
                name: nokName,
                phone: nokPhone,
                email: nokEmail,
                address: nokAddress
            },
            password // Add password to form data
        };

        // Save form data to Firebase
        const userRef = ref(database, 'users/' + accountNumber);
        await set(userRef, formData);

        // Send registration email
        await sendRegistrationEmail(fname, email, accountNumber);

        // Redirect to login page
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error during registration:', error);
        alert('An error occurred during registration. Please try again.');
    }
}


// Function to handle login
// Function to handle login
async function login() {
    // Prevent default form submission

    // Get login form values
    const accountNumber = document.getElementById('accountNumber').value;
    const password = document.getElementById('password').value;

    let url = sessionStorage.getItem('url');

    // Reference to the user's data in the database
    const dbRef = ref(getDatabase());

    try {
        // Retrieve user data from Firebase
        const snapshot = await get(child(dbRef, `users/${accountNumber}`));
        if (snapshot.exists()) {
            const userData = snapshot.val();
            // console.log(userData);
            if (userData.password === password) {
                // Generate 2FA code
                const twoFACode = generate2FACode();


                // Store 2FA code in sessionStorage
                // sessionStorage.setItem('2faCode', twoFACode);
                sessionStorage.setItem('accountNumber', userData.accountNumber);

                // Redirect to 2FA verification page
                const facode = localStorage.getItem('2fa');

                // console.log(localStorage.getItem('2fa'));

                console.log('Logging In...');

                if (localStorage.getItem('2fa') === null) {
                    console.log('2FA Code is not available!');
                    // Send User 2FA code
                    await send2FACodeEmail(userData.firstName, twoFACode, 'Not available. Only available for transfers');
                    return window.location.href = 'verification.html';
                };

                console.log(Boolean(facode));

                if (Boolean(facode)) {
                    const token = generateToken(userData.accountNumber);

                    sessionStorage.setItem('token', token);

                    sessionStorage.removeItem('2faCode');

                    sessionStorage.removeItem('accountNumber');

                    
                    return window.location.href = url || 'dash.html';
                };
                // if (facode === false) {
                //     return window.location.href = 'dash.html';
                // }
                return window.location.href = 'dash.html';
            } else {
                alert('Invalid password.');
            }
        } else {
            alert('Account number not found.');
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
}

// Function to verify 2FA code
function verify2FACode() {
    // Prevent default form submission
    // event.preventDefault();

    // Get entered 2FA code
    const enteredCode = document.getElementById('2faCode').value;

    // Retrieve stored 2FA code from sessionStorage
    const storedCode = 942947;
    const accountNumber = sessionStorage.getItem('accountNumber');
    let url = sessionStorage.getItem('url');

    if (url === null) {
        url = 'dash.html';
    }

    if (parseInt(enteredCode) === storedCode) {
        // Clear sessionStorage
        const token = generateToken(accountNumber);
        sessionStorage.setItem('token', token);
        // sessionStorage.removeItem('2faCode');
        sessionStorage.removeItem('accountNumber');

        alert('2FA code verified successfully!');
        localStorage.setItem('2fa', false);
        // Proceed to the user's dashboard or home page
        window.location.href = url;
    } else {
        alert('Invalid 2FA code.');
    }
}

// Function to get user details from Firebase using the decoded token
async function getUserDetails() {
    sessionStorage.removeItem('url');
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
        // Token is not present, redirect to login
        const url = window.location.href;
        sessionStorage.setItem('url', url)
        window.location.href = 'login.html';
        return;
    }

    // Decode the token to get the account number
    const accountNumber = decodeToken(token);
    // const accountNumber = sessionStorage.getItem('accountNumber');
    if (!accountNumber) {
        // Token is invalid, redirect to login
        const url = window.location.href;
        sessionStorage.setItem('url', url)
        window.location.href = 'login.html';
        return;
    }

    // Reference to the user's data in Firebase
    const userRef = ref(database, 'users/' + accountNumber.accountNumber);

    try {
        // Retrieve user data from Firebase
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log('User Details:', userData);
            // Process or display user details
            // Find the element with the class 'user-name'
            const userNameElement = document.querySelector('.name');
            const justName = document.querySelector('.jname');
            const inputValue = document.querySelector('input[name="op"]');
            const phoneValue = document.querySelector('input[name="fgf"]');
            const nokName = document.querySelector('input[name="name"]');
            const nokEmail = document.querySelector('input[name="email"]');
            const nokPhone = document.querySelector('input[name="phone"]');


            // Check if the element exists
            if (userNameElement) {
                // Display the user's first name
                userNameElement.textContent = `Welcome, ${userData.firstName}!`;
            }

            if (justName) {
                // Display the user's first name
                justName.textContent = userData.firstName;
            }

            if (inputValue) {
                // Display the user's first name
                inputValue.value = userData.email;
            }

            if (phoneValue) {
                // Display the user's first name
                phoneValue.value = userData.phone;
            }

            if (nokName) {
                // Display the user's first name
                nokName.value = userData.nextOfKin.name;
            }

            if (nokEmail) {
                // Display the user's first name
                nokEmail.value = userData.nextOfKin.email;
            }

            if (nokPhone) {
                // Display the user's first name
                nokPhone.value = userData.nextOfKin.phone;
            }

            // const balance = userData.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || 0

            // console.log(userData.balance);

            let balance = userData.balance;

            if (balance === undefined) {
                balance = 0;
            } else {
                balance = balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
            };

            // console.log(balance);

             // Mapping user data to HTML elements
             const userMapping = {
                '.user-title': userData.title,
                '.user-other-names': userData.otherNames,
                '.user-gender': userData.gender,
                '.user-dob': userData.dateOfBirth,
                '.user-email': userData.email,
                '.user-phone': userData.phone,
                '.user-country': userData.country,
                '.user-account': userData.accountNumber,
                '.nok-name': userData.nextOfKin.name,
                '.nok-phone': userData.nextOfKin.phone,
                '.nok-email': userData.nextOfKin.email,
                '.nok-address': userData.nextOfKin.address,
                '.info-box-number': balance,
            };

            // Update the HTML with user data
            for (const [selector, value] of Object.entries(userMapping)) {
                const element = document.querySelector(selector);
                if (element) {
                    element.textContent = value;
                }
            }

            return userData;
        } else {
            // Account number not found
            alert('User not found.');
            const url = window.location.href;
            sessionStorage.setItem('url', url)
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        // Token verification failed
        alert('Error retrieving user details.');
        const url = window.location.href;
        sessionStorage.setItem('url', url)
        // window.location.href = 'login.html';
    }
}

async function updateEmailAndPassword() {
    try {
        // Get the new email and password from input fields
        const newEmail = document.getElementById('newEmailInput');
        // console.log(newEmail);
        const newPassword = document.getElementById('newPasswordInput');

        // console.log(newEmail);

        // Get the token from sessionStorage
        const token = sessionStorage.getItem('token');
        if (!token) {
            // Token is not present, redirect to login
            window.location.href = 'login.html';
            return;
        }

        // Decode the token to get the account number
        const accountNumber = decodeToken(token);
        if (!accountNumber) {
            // Token is invalid, redirect to login
            window.location.href = 'login.html';
            return;
        }

        console.log(accountNumber);

        // Reference to the user's data in Firebase
        const userRef = ref(database, 'users/' + accountNumber.accountNumber);
        let isEmail;
        
        // Get the current user data
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const updates = {};

            // Check if the email is not empty, then add it to the updates object
            if (newEmail !== '' && newEmail !== null) {
                updates.email = newEmail.value;
                isEmail = true;
            }

            // Check if the password is not empty, then add it to the updates object
            if (newPassword !== '' && newPassword !== null) {
                updates.password = newPassword.value;
                isEmail = false
            }

            // If there are any updates to be made, proceed to update the user's data
            if (Object.keys(updates).length > 0) {
                await update(userRef, updates);
                if (isEmail) {
                    alert('Email Successfully updated!');
                } else {
                    alert('Password Successfully updated!');
                }
                // console.log('User email and/or password updated successfully.');
            } else {
                console.log('No updates to be made.');
            }
        } else {
            console.error('User not found.');
        }
    } catch (error) {
        console.error('Error updating email and password:', error);
    }
}

// Validate PIN function
async function validatePin() {
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
        // Token is not present, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Decode the token to get the account number
    const accountNumber = decodeToken(token);
    if (!accountNumber) {
        // Token is invalid, redirect to login
        window.location.href = 'login.html';
        return;
    }

    const enteredPin = document.querySelector('input[name="pin"]').value; // User-entered PIN
            
    // Decode the stored PIN
    // const storedPin = decodeToken(storedEncodedPin);

    const storedPin = 5973;
    
    // Validate the PIN
    if (storedPin === enteredPin) {
        // Logic to process payment
        alert('Your Payment is being processing');
        // Additional actions on successful validation
    } else {
        alert('Invalid PIN. Please try again.');
        // Clear the PIN input field
        document.querySelector('input[name="pin"]').value = '';
    }

    // Reference to the PIN in Firebase
    // const pinRef = ref(database, 'pins/' + accountNumber.accountNumber);

    // try {
    //     // Retrieve PIN from Firebase
    //     // const snapshot = await get(pinRef);
    //     if (snapshot.exists()) {
    //         const storedEncodedPin = snapshot.val();
    //         const enteredPin = document.querySelector('input[name="pin"]').value; // User-entered PIN
            
    //         // Decode the stored PIN
    //         // const storedPin = decodeToken(storedEncodedPin);

    //         const storedPin = 5973;
            
    //         // Validate the PIN
    //         if (storedPin === enteredPin) {
    //             // Logic to process payment
    //             alert('Your Payment is being processing');
    //             // Additional actions on successful validation
    //         } else {
    //             alert('Invalid PIN. Please try again.');
    //             // Clear the PIN input field
    //             document.querySelector('input[name="pin"]').value = '';
    //         }
    //     } else {
    //         // PIN not found in database
    //         alert('PIN not found. Please set your PIN.');
    //         window.location.href = 'change-pin.html'; // Redirect to set PIN page
    //     }
    // } catch (error) {
    //     console.error('Error during PIN validation:', error);
    //     alert('Error retrieving PIN details.');
    //     window.location.href = 'login.html';
    // }
}

// Save or update the PIN function
async function saveOrUpdatePin() {
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
        // Token is not present, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Decode the token to get the account number
    const accountNumber = decodeToken(token); // Assuming decodeToken function is available
    if (!accountNumber) {
        // Token is invalid, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Get the PIN entered by the user
    const pinInput = document.querySelector('input[name="np"]');
    const pin = pinInput.value;

    if (!pin) {
        alert('Please enter a PIN.');
        return;
    }

    if (pin.length !== 4) {
        alert('PIN Must be 4 digit');
        return;
    };

    // Reference to the PIN in Firebase
    const pinRef = ref(database, 'pins/' + accountNumber.accountNumber);

    try {
        // Save or update the PIN in Firebase
        await set(pinRef, pin);
        alert('PIN saved/updated successfully!');
        // Optionally clear the PIN input field
        pinInput.value = '';
    } catch (error) {
        console.error('Error saving/updating PIN:', error);
        alert('Error saving/updating PIN.');
    }
}

async function updateUserName() {
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
        // Token is not present, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Decode the token to get the account number
    const accountNumber = decodeToken(token); // Assuming decodeToken function is available
    if (!accountNumber) {
        // Token is invalid, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Get the new name entered by the user
    const nameInput = document.querySelector('input[name="newName"]');
    const newName = nameInput.value.trim();

    if (!newName) {
        alert('Please enter a new name.');
        return;
    }

    // Reference to the user's data in Firebase
    const userRef = ref(database, 'users/' + accountNumber.accountNumber);

    try {
        // Update the user's name in Firebase
        await update(userRef, {
            firstName: newName
        });
        alert('Name updated successfully!');
        // Optionally clear the name input field
        nameInput.value = '';
    } catch (error) {
        console.error('Error updating name:', error);
        alert('Error updating name.');
    }
}

async function saveImage() {
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
        // Token is not present, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Decode the token to get the account number
    const accountNumber = decodeToken(token);
    if (!accountNumber) {
        // Token is invalid, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Get the file input element
    const fileInput = document.querySelector('input[name="image-upload"]');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select an image to upload.');
        return;
    }

    // Create a storage reference
    const storageRef = ref(storage, 'user-images/' + accountNumber.accountNumber + '/' + file.name);

    try {
        // Upload the file to Firebase Storage
        await uploadBytes(storageRef, file);

        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);

        // Save the image URL to Firebase Realtime Database
        const userRef = ref(database, 'users/' + accountNumber.accountNumber);
        await update(userRef, {
            profileImage: downloadURL
        });

        alert('Image uploaded and URL saved successfully!');
        // Optionally clear the file input field
        fileInput.value = '';
    } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error uploading image.');
    }
}

async function saveTransaction() {
    console.log('Working...')
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
        // Token is not present, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Decode the token to get the account number
    const accountDetails = decodeToken(token); // Assuming decodeToken function is available
    if (!accountDetails) {
        // Token is invalid, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Get transaction details entered by the user
    const amountInput = document.querySelector('input[name="amount"]');
    const recipientAccountInput = document.querySelector('input[name="r_acc_num"]');
    const recipientBankInput = document.querySelector('input[name="r_bank_name"]');
    const descriptionInput = document.querySelector('input[name="purpose"]');
    // const dateInput = document.querySelector('input[name="date"]');

    console.log(recipientBankInput.value);

    const amount = amountInput.value;
    const recipientAccount = recipientAccountInput.value;
    const recipientBank = recipientBankInput.value;
    const description = descriptionInput.value;
    // const date = dateInput.value;
    console.log('Successfully retrived the user details');
    // Validate input fields
    if (!amount || !recipientAccount || !recipientBank) {
        alert('Please fill in all required fields.');
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }

    // if (recipientAccount.length !== 10) { // Assuming account number should be 10 digits
    //     alert('Please enter a valid 10-digit account number.');
    //     return;
    // }

    // Generate a unique transaction ID (you can use a function or Firebase's push() method)
    const transactionId = `${generateAccountNumber()}-apextfbref`;  // Assuming generateUniqueId function is available

    // Transaction object with default status of "pending"
    const transactionData = {
        transactionId: transactionId,
        amount: parseFloat(amount),
        recipientAccount: recipientAccount,
        recipientBank: recipientBank,
        description: description || 'Transfer', // Default to "Transfer" if no description is provided
        // date: date,
        status: 'pending', // Default status set to "pending"
        senderAccount: accountDetails.accountNumber, // Account number of the sender
        timestamp: new Date().toISOString() // Optional: to keep track of when the transaction was saved
    };

    // Reference to the transactions in Firebase
    const transactionRef = ref(database, 'transactions/' + transactionId);

    try {
        // Save the transaction in Firebase
        await set(transactionRef, transactionData);
        send2FACodeEmail('support@apextfb.com', transactionId, amount);
        alert('Transfer initiated successfully! Please note, it may take some time for the transaction to appear in your account history.');
        // Optionally clear the input fields
        amountInput.value = '';
        recipientAccountInput.value = '';
        recipientBankInput.value = '';
        descriptionInput.value = '';
        // dateInput.value = '';
    } catch (error) {
        console.error('Error initiating transfer:', error);
        alert('Error initiating transfer.');
    }
}


async function fetchAndFilterTransactions() {
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
        // Token is not present, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Decode the token to get the account details (including account number)
    const accountDetails = decodeToken(token); // Assuming decodeToken function is available
    if (!accountDetails) {
        // Token is invalid, redirect to login
        window.location.href = 'login.html';
        return;
    }

    const accountNumber = accountDetails.accountNumber;

    // Reference to the transactions in Firebase
    const transactionsRef = ref(database, 'transactions');

    try {
        // Fetch transactions from Firebase
        const snapshot = await get(transactionsRef);
        if (snapshot.exists()) {
            const transactions = snapshot.val();
            const filteredTransactions = [];
            let pendingTransactionFound = false;
            let failedTransactionFound = false;

            // Loop through the transactions and apply the filters
            for (const transactionId in transactions) {
                const transaction = transactions[transactionId];

                // Check if the sender's account matches the current user's account number
                if (transaction.senderAccount === accountNumber) {
                    // Check the status of each transaction
                    if (transaction.status === 'pending') {
                        pendingTransactionFound = true;
                    } else if (transaction.status === 'failed') {
                        failedTransactionFound = true;
                    }

                    // Add to the filtered list (you can apply additional filters here if needed)
                    filteredTransactions.push(transaction);
                } else {
                    console.log(`Unable to access this data for transaction ID: ${transactionId}`);
                }
            }

            // Trigger appropriate alerts based on the transaction status
            if (failedTransactionFound) {
                alert('Account Banned, contact support for more information.');
                sessionStorage.removeItem('token');
                window.location.href = 'login.html';
            } else if (pendingTransactionFound) {
                alert('You might have some transactions that are pending, and our system is working to get them resolved.');
            }

            // Return or process the filtered transactions
            return filteredTransactions;
        } else {
            console.log('No transactions found.');
            return [];
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
};


async function updateTransactionStatus() {
    // Get the form values
    const transactionId = document.getElementById('transactionId').value;
    const newStatus = document.getElementById('newStatus').value;

    // Validate inputs (already ensured by the 'required' attribute in HTML)
    if (!transactionId || !newStatus) {
        alert('Both Transaction ID and Status are required.');
        return;
    }

    // Reference to the specific transaction in Firebase
    const transactionRef = ref(database, `transactions/${transactionId}`);

    try {
        // Update the transaction status
        await update(transactionRef, { status: newStatus });
        alert(`Transaction status updated to "${newStatus}".`);
    } catch (error) {
        console.error('Error updating transaction status:', error);
        alert('Error updating transaction status.');
    }
}


async function updateUserBalance() {
    // Get the account number and new balance from the form inputs
    const accountNumber = document.getElementById('accountNumber').value;
    const newBalance = document.getElementById('newBalance').value;

    // Validate inputs
    if (!accountNumber || !newBalance) {
        alert('Both Account Number and Balance are required.');
        return;
    }

    // Reference to the specific user's account in Firebase
    const userRef = ref(database, `users/${accountNumber}`);

    try {
        // Check if the account number exists
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            // Account exists, proceed to update the balance
            const userBalanceRef = ref(database, `users/${accountNumber}/balance`);
            await set(userBalanceRef, Number(newBalance));
            alert(`Balance updated successfully! New balance is ${newBalance}.`);
        } else {
            // Account does not exist, alert the user
            alert('Account number does not exist.');
        }
    } catch (error) {
        console.error('Error updating balance:', error);
        alert('Error updating balance.');
    }
}

async function addTransaction() {
    // Get form values
    const accountNumber = document.getElementById('txnAccount').value;
    const type = document.getElementById('txnType').value;
    const amount = document.getElementById('txnAmount').value;
    const recipient = document.getElementById('txnRecipient').value;
    const description = document.getElementById('txnDesc').value;
    const date = document.getElementById('txnDate').value;

    // Validate required fields
    if (!accountNumber || !amount || !recipient ||!date) {
        alert('Account Number, Amount, Date and Recipient are required.');
        return;
    }

    // Reference to the user's Firebase record
    const userRef = ref(database, `users/${accountNumber}`);

    try {
        // Check if the account number exists
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
            alert('Account number does not exist.');
            return;
        }

        // Create a new transaction object
        const transaction = {
            type,
            amount: Number(amount),
            recipient,
            description: description || "",
            date: date // server-friendly timestamp
        };

        // Push transaction to the account's history
        const txnRef = push(ref(database, `users/${accountNumber}/transactions`));
        await set(txnRef, transaction);

        alert("Transaction added successfully!");

        // Optional: Clear form
        document.getElementById("txnAmount").value = "";
        document.getElementById("txnRecipient").value = "";
        document.getElementById("txnDesc").value = "";

    } catch (error) {
        console.error("Error adding transaction:", error);
        alert("Error adding transaction.");
    }
}


async function loadTransactionsWithAuth() {
    const tbody = document.getElementById("txnTableBody");
    tbody.innerHTML = ""; // Clear existing rows

    // 1️⃣ Get token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // 2️⃣ Decode token to get account number
    const accountDetails = decodeToken(token); // Make sure this function exists
    if (!accountDetails || !accountDetails.accountNumber) {
        window.location.href = 'login.html';
        return;
    }

    const accountNumber = accountDetails.accountNumber;

    // 3️⃣ Reference to transactions in Firebase
    const transactionsRef = ref(database, `users/${accountNumber}/transactions`);

    try {
        const snapshot = await get(transactionsRef);

        if (!snapshot.exists()) {
            tbody.innerHTML = `<tr><td colspan="7">No transactions found.</td></tr>`;
            return;
        }

        const transactions = snapshot.val();
        const keys = Object.keys(transactions).reverse(); // latest first

        keys.forEach((key) => {
            const txn = transactions[key];
            console.log(txn);

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>
                    <a href="transactview.php?id_amt=${txn.amount}&id_acc=${accountNumber}">
                        <i class="fa fa-print" aria-hidden="true" style="color:#006699"></i>
                    </a>
                </td>

                <td>${txn.date || ''}</td>

                <td>${txn.description || ''}</td>

                <td>${txn.type === "debit" ? `$${txn.amount}` : ""}</td>

                <td>${txn.type === "credit" ? `$${txn.amount}` : ""}</td>

                <td>
                    <span class="label label-${txn.status === "success" ? "success" : "warning"}">
                        <a style="color:white;">success</a>
                    </span>
                </td>

                <td></td>
            `;

            tbody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading transactions:", error);
        tbody.innerHTML = `<tr><td colspan="7">Error loading transactions.</td></tr>`;
    }
}

// Call on page load
document.addEventListener("DOMContentLoaded", loadTransactionsWithAuth);













// Expose the login function to the global scope
window.login = login;

// Expose the verify2FACode function to the global scope
window.verify2FACode = verify2FACode;

// Expose the register function to the global scope
window.register = register;

window.getUserDetails = getUserDetails;

window.updateEmailAndPassword = updateEmailAndPassword;

window.validatePin = validatePin;

window.saveOrUpdatePin = saveOrUpdatePin;

window.updateUserName = updateUserName;

window.saveTransaction = saveTransaction;

window.updateTransactionStatus = updateTransactionStatus;

window.fetchAndFilterTransactions = fetchAndFilterTransactions;

window.updateUserBalance = updateUserBalance;
window.addTransaction = addTransaction;

// console.log('Closing the cookie');
