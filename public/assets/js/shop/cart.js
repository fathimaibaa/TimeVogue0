
let data;
const checkoutBtn = document.getElementById("checkoutBtn");

function updateCartMessage(data) {
  const cartMessage = document.getElementById("cart-message");

 
  cartMessage.innerHTML = data.message;
  cartMessage.className = `position-fixed bg-${data.status} text-white p-2 rounded`;
  cartMessage.style.display = "block";

 
  setTimeout(function () {
    cartMessage.style.display = "none";
  }, 3000);
}

function updateCartCount(data) {
  const cartCount = document.getElementById("cartCount");

  
  if (data.count !== undefined) {
    cartCount.innerText = data.count;
  }
}

function updateQuantityDisplay(id, data) {
  const quantitySpan = document.getElementById(`quantity_${id}`);
  const totalProductPrice = document.getElementById(
    `totalProductPrice_${id}`
  );

 
  if (quantitySpan) {
    quantitySpan.innerText = data.quantity;
    totalProductPrice.innerText = data.productTotal.toFixed(2);
  }
}

function managePlusButton(data) {
  const plusBtnDisabled = document.getElementById("plusBtnDisabled");
  const plusBtn = document.getElementById("plusBtn");

  if (data.status === "warning") {
    plusBtnDisabled.style.pointerEvents = "all";
  }
}

function updateCartTotal(data) {
  const subTotal = document.getElementById("subtotal");
  const cartTotal = document.getElementById("cart-total");
  subTotal.innerText = data.subtotal;
  cartTotal.innerText = data.total;
}

function updateQuantity(id, isIncrement) {
  const action = isIncrement ? "inc" : "dec";
  const url = `/cart/${action}/${id}`;

  fetch(url, {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        console.error("Failed");
      }
    })
    .then((responseData) => {
      if (responseData) {
        data = responseData;

        if (data.quantity <= 0) {
          location.reload();
        }

        updateCartMessage(data);

        updateCartCount(data);

        updateQuantityDisplay(id, data);

        updateCartTotal(data);
      }
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });
}

const plusButtons = document.querySelectorAll(".plusBtn");
const minusButtons = document.querySelectorAll(".minusBtn");

plusButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const productId = this.getAttribute("data-product-id");
    updateQuantity(productId, true);
  });
});

minusButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const productId = this.getAttribute("data-product-id");
    updateQuantity(productId, false);
  });
});


function addToCart(id) {
 
  const productId = id;
  const url = `/cart/add/${productId}`;
  const cartCount = document.getElementById("cartCount");
  const cartMessage = document.getElementById("cart-message");

  fetch(url, {
      method: "GET",
  })
      .then((response) => {
          if (response.ok) {
            
              return response.json();
          } else {
             
              console.error("Failed");
          }
      })
      .then((data) => {
          if (data) {
              if (data.count && data.message) {
                 
                  
                  cartMessage.innerText = data.message;

                  cartMessage.className = `position-fixed bg-${data.status} text-white p-2 rounded`;
                  cartMessage.style.display = "block";

                  setTimeout(function () {
                      cartMessage.style.display = "none";
                  }, 3000);
              } else {
                  console.error("Unexpected data format");
              }
          }
      })
      .catch((error) => {
          console.error("An error occurred:", error);
      });
}