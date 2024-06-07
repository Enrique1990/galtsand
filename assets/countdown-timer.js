document.addEventListener("DOMContentLoaded", function() {
    var countdownElement = document.getElementById("countdown-timer");
    var countdownFunction;

    function startCountdown() {
        var endTime = localStorage.getItem('countdownEndTime');
        if (!endTime) {
            endTime = new Date(new Date().getTime() + 15 * 60 * 1000); // 15 minutes from now
            localStorage.setItem('countdownEndTime', endTime);
        } else {
            endTime = new Date(endTime);
        }

        countdownFunction = setInterval(function() {
            var now = new Date().getTime();
            var distance = endTime - now;

            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;

            countdownElement.innerHTML = "HURRY UP!!" + "<br>" + "Use cupon code CART5 for 5% OFF " + "<br>" + minutes + ": " + seconds + "s ";

            if (distance < 0) {
                clearInterval(countdownFunction);
                countdownElement.innerHTML = "YOUR OFFER IS EXPIRED";
                localStorage.removeItem('countdownEndTime');
            }
        }, 1000);
    }

    function stopCountdown() {
        clearInterval(countdownFunction);
        countdownElement.innerHTML = "";
        localStorage.removeItem('countdownEndTime');
    }

    function checkCart() {
        fetch('/cart.js')
            .then(response => response.json())
            .then(data => {
                if (data.item_count > 0) {
                    countdownElement.style.display = 'block';
                    if (!countdownFunction) {
                        startCountdown();
                    }
                } else {
                    countdownElement.style.display = 'none';
                    stopCountdown();
                }
            });
    }

    // Check the cart on page load
    checkCart();

    // Override Shopify's AJAX cart update functions to trigger cart:updated event
    function overrideCartFunctions() {
        var originalAddItem = Shopify.addItem;
        Shopify.addItem = function() {
            var result = originalAddItem.apply(this, arguments);
            result.then(() => {
                document.dispatchEvent(new Event('cart:updated'));
                checkCart();
            });
            return result;
        };

        var originalAddItemFromForm = Shopify.addItemFromForm;
        Shopify.addItemFromForm = function() {
            var result = originalAddItemFromForm.apply(this, arguments);
            result.then(() => {
                document.dispatchEvent(new Event('cart:updated'));
                checkCart();
            });
            return result;
        };

        var originalRemoveItem = Shopify.removeItem;
        Shopify.removeItem = function() {
            var result = originalRemoveItem.apply(this, arguments);
            result.then(() => {
                document.dispatchEvent(new Event('cart:updated'));
                checkCart();
            });
            return result;
        };

        var originalUpdateItem = Shopify.updateItem;
        Shopify.updateItem = function() {
            var result = originalUpdateItem.apply(this, arguments);
            result.then(() => {
                document.dispatchEvent(new Event('cart:updated'));
                checkCart();
            });
            return result;
        };
    }

    // Listen for cart updates
    document.addEventListener('cart:updated', checkCart);

    // Override functions after a delay to ensure Shopify scripts are loaded
    setTimeout(overrideCartFunctions, 2000);
});
