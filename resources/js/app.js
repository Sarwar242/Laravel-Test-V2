import './bootstrap';
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});

$(document).ready(function() {
    loadProducts();

    $('#productForm').on('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            product_name: $('#product_name').val(),
            quantity: $('#quantity').val(),
            price: $('#price').val()
        };

        $.ajax({
            url: '/products',
            method: 'POST',
            data: formData,
            success: function(response) {
                if (response.success) {
                    loadProducts();
                    $('#productForm')[0].reset();
                }
            },
            error: function(xhr) {
                const errors = xhr.responseJSON.errors;
                let errorMessage = 'Validation errors:\n';
                Object.keys(errors).forEach(key => {
                    errorMessage += `${errors[key][0]}\n`;
                });
                alert(errorMessage);
            }
        });
    });

    $(document).on('click', '.edit-btn', function() {
        const row = $(this).closest('tr');
        const id = row.data('id');
        const productName = row.find('td:eq(0)').text();
        const quantity = row.find('td:eq(1)').text();
        const price = row.find('td:eq(2)').text();

        $('#editId').val(id);
        $('#editProductName').val(productName);
        $('#editQuantity').val(quantity);
        $('#editPrice').val(price.replace('$', ''));

        const editModal = new bootstrap.Modal(document.getElementById('editModal'));
        editModal.show();
    });

    $('#saveEdit').on('click', function() {
        const id = $('#editId').val();
        const formData = {
            product_name: $('#editProductName').val(),
            quantity: $('#editQuantity').val(),
            price: $('#editPrice').val()
        };

        $.ajax({
            url: `/products/${id}`,
            method: 'PUT',
            data: formData,
            success: function(response) {
                if (response.success) {
                    loadProducts();
                    const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
                    editModal.hide();
                }
            },
            error: function(xhr) {
                const errors = xhr.responseJSON.errors;
                let errorMessage = 'Validation errors:\n';
                Object.keys(errors).forEach(key => {
                    errorMessage += `${errors[key][0]}\n`;
                });
                alert(errorMessage);
            }
        });
    });
});

function loadProducts() {
    $.ajax({
        url: '/products/list',
        method: 'GET',
        success: function(response) {
            if (response.success) {
                updateTable(response.data, response.total);
            }
        },
        error: function() {
            alert('Error loading products');
        }
    });
}

function updateTable(products, grandTotal) {
    const tbody = $('#productsTableBody');
    tbody.empty();
    console.log(products);
    products.forEach(function(product) {
        console.log(product);
        tbody.append(`
            <tr data-id="${product.id}">
                <td>${product.product_name}</td>
                <td>${product.quantity}</td>
                <td>$${parseFloat(product.price)}</td>
                <td>${new Date(product.created_at).toLocaleString()}</td>
                <td>$${product.total_value}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-btn">Edit</button>
                </td>
            </tr>
        `);
    });

    $('#grandTotal').html(`<strong>$${grandTotal.toFixed(2)}</strong>`);
}