
const query = window.location.search;
const queryParams = new URLSearchParams(query);
const lowtoHigh = document.getElementById('lowToHigh')
const highToLow = document.getElementById('highToLow')
const pages = queryParams.get('p')
const selectedCategory = queryParams.get('category')
const baseURL = '/shop';

const queryParameters = [];

if (selectedCategory) {
    queryParameters.push(`category=${selectedCategory}`);
}


lowtoHigh.addEventListener('click', (e) => {
    e.preventDefault()
    queryParameters.push(`sort=lowtoHigh`);

    const finalURL = baseURL + (queryParameters.length > 0 ? `?${queryParameters.join('&')}` : '');
   
    window.location.href = finalURL
})

highToLow.addEventListener('click', (e) => {
    e.preventDefault()
    
    queryParameters.push(`sort=highToLow`);
    const finalURL = baseURL + (queryParameters.length > 0 ? `?${queryParameters.join('&')}` : '');
   
    window.location.href = finalURL

})

function navigatePage(page) {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set('p', page);
    const newURL = `${window.location.pathname}?${queryParams.toString()}`;
    window.location.href = newURL; 
}




function addTowishlist(productId) {
    const wishlistMessage = document.getElementById('wishlist-message')
    const fixedDiv = document.getElementById('fixed-div')

    function hide() {
        fixedDiv.style.display = 'none';
    }
    $.ajax({
        type: 'GET',
        url: `/addTo-wishlist/${productId}`,
        success: function (response) {
            if (response.success) {
                fixedDiv.style = 'block'
                fixedDiv.style.color = 'red'
                fixedDiv.style.backgroundColor = 'green';
                wishlistMessage.innerText = response.message
                setTimeout(hide, 3000);
            } else {
              
                fixedDiv.style.color = ''
                fixedDiv.style = 'block'
                fixedDiv.style.backgroundColor = 'red';
                wishlistMessage.innerText = response.message
                setTimeout(hide, 3000);

            }
        },
        error: function (textStatus, errorThrown) {

          
        }
    })
}