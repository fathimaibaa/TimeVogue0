

function displayError(inputField, message) {
    const errorMessage = inputField.nextElementSibling;
    if (errorMessage && errorMessage.classList.contains('error-message')) {
        errorMessage.textContent = message;
        errorMessage.style.color = 'red';
        setTimeout(function () {
            hideError(inputField);
        }, 5000);
    }
}


function hideError(inputField) {
    const errorMessage = inputField.nextElementSibling;
    errorMessage.textContent = "";
}

function validateProductForm() {
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const colorInput = document.getElementById('color');
    const brandInput = document.getElementById('brand');
    const categoryInput = document.getElementById('category');
    const productPriceInput = document.getElementById('productPrice');
    const salePriceInput = document.getElementById('salePrice');
    const quantityInput = document.getElementById('quantity');
    const imageInput = document.getElementById('image');


    if (productPriceInput.value < 1) {
        displayError(productPriceInput, "Product price Cannot be less be 1 rupees");
        return false; 
    }
    if (salePriceInput.value < 0) {
        displayError(salePriceInput, " Sale price Cannot be less than  1 rupees");
        return false; 
    }
    if (quantityInput.value < 0) {
        displayError(quantityInput, " Quantity Cannot be less be 1 or negative value");
        return false; 
    }


if (isNaN(quantityInput.value) || quantityInput.value < 1) {
    displayError(quantityInput, "Quantity must be a numeral greater than or equal to 1");
    return false; 
}




    if (titleInput.value.trim() === '') {
        displayError(titleInput, "Field is required");
        return false; 
    }


    
    if (descriptionInput.value.trim() === '') {
        displayError(descriptionInput, "Field is required");
        return false; 
    }
    if (colorInput.value.trim() === '') {
        displayError(colorInput, "Field is required");
        return false;
    }
    if (brandInput.value.trim() === '') {
        displayError(brandInput, "Field is required");
        return false; 
    }
    if (categoryInput.value.trim() === '') {
        displayError(categoryInput, "Field is required");
        return false;
    }
    if (productPriceInput.value.trim() === '') {
        displayError(productPriceInput, "Field is required");
        return false; 
    }
    if (salePriceInput.value.trim() == '') {
        displayError(salePriceInput, "Field is required");
        return false; 
    }
    if (quantityInput.value.trim() == '') {
        displayError(quantityInput, "Field is required");
        return false; 
    }
    if (imageInput.value.trim() === '') {
        displayError(imageInput, "Field is required");
        return false; 
    }
    


    return true;
}