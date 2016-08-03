/**
 * Created by niki_ on 6/23/2016.
 */
function showView(viewName) {
    $('main > section').hide();
    $('#' + viewName).fadeIn();
}
function showHomeView() {
    showView('viewHome');
}
function showLoginView() {
    showView('viewLogin');
}
function showRegisterView() {
    showView('viewRegister');
}
function showCreateBookView() {
    showView('viewCreatedBook');
}
function showListBooksView() {
    showView('viewBooks');
}
function logout() {
    sessionStorage.clear();
    showHideNavLinks();
    showView('viewHome');
}
$("#linkHome").click(showHomeView);
$("#linkLogin").click(showLoginView);
$("#linkRegister").click(showRegisterView);
$("#linkCreateBooks").click(showCreateBookView);
$("#linkListBooks").click(showListBooksView);
$("#linkLogout").click(logout);

$('#formLogin').submit(function (e) {e.preventDefault(); login();});
$('#formRegister').submit(function (e) {e.preventDefault(); register();});
$('#formCreateBook').submit(function (e) {e.preventDefault(); createBook();});

function showHideNavLinks() {
    $('#linkHome').show();
    if(sessionStorage.getItem('authToken') == null){
        $('#linkLogin').show();
        $('#linkRegister').show();
        $('#linkLogout').hide();
        $('#linkListBooks').hide();
        $('#linkCreateBooks').hide();
    }else{
        $('#linkLogin').hide();
        $('#linkRegister').hide();
        $('#linkLogout').show();
        $('#linkListBooks').show();
        $('#linkCreateBooks').show();
    }
}

function showInfo(message){
    $('#infoBox').text(message);
    $('#infoBox').show();
    setTimeout(function () {
       $('#infoBox').fadeOut()
    },3000);
}

function showErroMessage(errorMsg) {
    $('#errorBox').text("Error: ",+errorMsg);
    $('#errorBox').show();
}

const kinveyBaseUrl = 'https://baas.kinvey.com/';
const kinveyAppID = 'kid_HJQwButH';
const kinveyAppSecret = '29c001eed21144b28ac79cd4716643dc';

function login() {
    const kinveyLoginUrl =  kinveyBaseUrl + "user/" + kinveyAppID +"/login";
    let authBase64 = btoa(kinveyAppID + ":" + kinveyAppSecret);

    let userData = {
        username:$('#loginUser').val(),
        password:$('#loginPass').val()
    };
    $.ajax({
        method: "POST",
        url: kinveyLoginUrl,
        headers: {"Authorization": "Basic "+ authBase64 },
        data: userData,
        success: loginSuccess,
        error: handleAjaxError
    });

    function loginSuccess(response){
        let userAuth = response._kmd.authtoken;
        sessionStorage.setItem('authToken',userAuth);
        showHideNavLinks();
        listBooks();
        showInfo('Login successful.');
    }

    function handleAjaxError(response) {
        showErroMessage(response);
    }
}
function register(){
    const kinveyLoginUrl =  kinveyBaseUrl + "user/" + kinveyAppID +"/";
    const kinveyAuthHeaders = {
        'Authorization': "Basic " + btoa(kinveyAppID + ":" + kinveyAppSecret),
    };
    let userData = {
        username:$('#registerUser').val(),
        password:$('#registerPass').val()
    };
    $.ajax({
        method: "POST",
        url: kinveyLoginUrl,
        headers: kinveyAuthHeaders,
        data: userData,
        success: registerSuccess,
        error: showAjaxErrors
    });

    function registerSuccess(response){
        let userAuth = response._kmd.authtoken;
        sessionStorage.setItem('authToken',userAuth);
        showHideNavLinks();
        listBooks();
        showInfo('User registration successful.');
    }
    function showAjaxErrors(response) {
        console.log("Яко грешки");
    }
}

function listBooks(){

    $('#books').empty();
    showView('viewBooks');

    const booksUrl =  kinveyBaseUrl + "appdata/" + kinveyAppID +"/books";
    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + sessionStorage.authToken
    };
    $.ajax({
        method: "GET",
        url: booksUrl,
        headers: kinveyAuthHeaders,
        success: loadBooks,
        error: showAjaxErrors
    });

    function loadBooks(books) {
        showInfo('Books loaded!');
        if (books.length == 0) {
            $('#books').text('No books in library');
        } else {
            let booksTable = $('<table class="table table-striped">').append($('<tr>')
                .append('<th>Title</th>',
                    '<th>Author</th>',
                    '<th>Description</th>'));
            for (let book of books) {
                booksTable.append($('<tr>').append(
                    $('<td>').text(book.title),
                    $('<td>').text(book.author),
                    $('<td>').text(book.description)
                ));
            }
            $('#books').append(booksTable);
        }
    }

    function  showAjaxErrors(data) {
        showErroMessage(JSON.stringify(data));
    }
}

function createBook(){
    const kinveyBooksUrl =  kinveyBaseUrl + "appdata/"+ kinveyAppID + "/books";
    const kinveyAuthHeaders = {
        'Authorization':"Kinvey " + sessionStorage.getItem('authToken'),
    };
    let bookData = {
        title: $('#bookTitle').val(),
        author: $('#bookAuthor').val(),
        description: $('#bookDescription').val()
    }

    $.ajax({
        method: "POST",
        url: kinveyBooksUrl,
        headers: kinveyAuthHeaders,
        data: bookData,
        success: createBookSuccess,
        error: showAjaxErrors
    });
    
    function createBookSuccess(response) {
        listBooks();
        showInfo('Book created.');
    }
    function  showAjaxErrors(data) {
        showErroMessage(data);
    }
}

function addBookComment(bookData,commentText,commentAuthor){

}

$(document).on({
   ajaxStart: function () {
       $('#loadingBox').show();
   },
    ajaxStop: function () {
        $('#loadingBox').hide();
    }
});

$(function(){
   showHideNavLinks();
    showView('viewHome');
});