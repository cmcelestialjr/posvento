import axios from 'axios';

export const productPrint = async (search, filterType, filterCategory) => {

    let productsPrint = [];

    try {
        const authToken = localStorage.getItem("token");
        const response = await axios.get(`/api/products/print`, {
            params: {
            search: search,
            filter: filterType,
            filterCategory: filterCategory
            },
            headers: { Authorization: `Bearer ${authToken}` },
        });
        productsPrint = response.data.data;
    } catch (error) {
      // console.log(error);
    }

    const printWindow = window.open('', '', 'height=600,width=800');
    
    if (!printWindow) return;

    const doc = printWindow.document;
        doc.title = "Products - PosVento"; 
        doc.head.innerHTML += `<title>Products</title>`;
        const body = doc.createElement('body');
    
        // Create styles
        const style = doc.createElement('style');
        style.textContent = `
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { 
                display: flex; 
                align-items: center; 
                justify-content: center;
                border-bottom: 2px solid black; 
                padding-bottom: 10px; 
                gap: 15px;
            }
            .header img { width: 70px; height: auto; }
            .header .middle-logo { margin: 0 0px; }
            .header-text { text-align: left; line-height: 1.2; flex: 1; }
            .header-text h4 { text-align: left; margin: 0; font-size: 18px; }
            .header-text p { margin: 0px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 5px; border: 1px solid #000; text-align: left; font-size: 12px; }
            th { text-align: center; font-size: 14px; }
            h2, h4 { text-align: center; }
            .supplier-date-container { 
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 3px;
                margin-top: 0px;
                align-items: start;
                font-size: 14px;
            }
            .supplier {
                text-align: left;
                margin-bottom: 0px;
                padding-bottom: 0px;
            }
            .date {
                text-align: right;
                align-self: start;
                margin-bottom: 0px;
            }
            .address {
                grid-column: span 2;
                text-align: left; 
                margin-top: 0px;
            }
            .underline {
                display: inline-block;
                border-bottom: 1px solid black;
            }
            .font-medium {
                font-weight: bold;
            }
            .no-border {
                border: none !important;
            }            
            .payment-status {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                margin-top: 5px;
            }
            .payment-status span {
                display: inline-block;
                width: 150px;
                border-bottom: 1px solid black;
            }
            .cheque-receipt {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                margin-top: -15px;
            }
            .cheque-receipt span {
                display: inline-block;
                width: 200px;
                border-bottom: 1px solid black;
            }
            .acknowledgment {
                font-style: italic;
                margin-top: -10px;
                font-size: 12px;
            }
            .signatories {
                display: flex;
                justify-content: space-between; /* Evenly distribute signatures */
                align-items: center;
                margin-top: 30px;
                font-size: 12px;
                gap: 20px; /* Adds spacing between each signature block */
            }

            .signature-block {
                text-align: center;
                flex: 1;
                position: relative;
            }
            .signature-line {
                display: block;
                width: 80%; /* Controls the length of the underline */
                border-top: 1px solid black; /* Creates the underline */
                margin: 0 auto 5px auto; /* Centers the line */
                height: 0px; /* Adds spacing between the line and text */
            }
            .signature-block p {
                margin: 0;
            }
            .footer {
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                background-color: #f8f9fa;
                text-align: center;
                padding: 10px 0;
                font-size: 12px;
                border-top: 1px solid #ccc;
            }
            .footer p {
                margin: 3px 0;
                font-size: 10px;
            }
        `;
        doc.head.appendChild(style);
    
        const header = doc.createElement('div');
        header.className = 'header';
    
        const leftLogo = doc.createElement('img');
        leftLogo.src = '/images/clstldev2.png'; 
        leftLogo.alt = 'Company Logo';

        // const middleLogo = doc.createElement('img');
        // middleLogo.src = '/images/rockfil.png';
        // middleLogo.alt = 'Company Logo';
        // middleLogo.className = 'middle-logo';
    
        const headerText = doc.createElement('div');
        headerText.className = 'header-text';
        headerText.innerHTML = `
            <h4>PosVento.</h4>
            <p>Tacloban City</p>
            <p>Mobile Nos: 0936-649-3663</p>
            <p>Email: cmcelestialjr@gmail.com</p>
        `;
    
        header.appendChild(leftLogo);
        // header.appendChild(middleLogo);
        header.appendChild(headerText);
    
        const title = doc.createElement('h4');
        title.innerText = 'Products';

        const table = doc.createElement('table');
    
        const thead = doc.createElement('thead');
        const headerRow = doc.createElement('tr');
        const headers = ['#', 'Code', 'Supplier', 'Image', 'Name', 'Category', 'Cost', 'Price', 'Qty'];
        const columnWidths = {
            '#': '5%',
            'Code': '10%',
            'Supplier': '10%',
            'Image': '15%',
            'Name': '15%',
            'Category': '15%',
            'Cost': '10%',
            'Price': '10%',
            'Qty': '10%'
        };
        headers.forEach(headerText => {
            const th = doc.createElement('th');
            th.innerText = headerText;
            th.style.width = columnWidths[headerText];
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
    
        const tbody = doc.createElement('tbody');
        
        productsPrint?.forEach((product, index) => {
            const row = doc.createElement('tr');
    
            const numberCell = doc.createElement('td');
            numberCell.style.textAlign = 'center';
            numberCell.innerText = index + 1;
            row.appendChild(numberCell);
    
            const codeCell = doc.createElement('td');
            codeCell.innerText = product.code || 'N/A';
            row.appendChild(codeCell);

            const uniqueSuppliers = product.pricing_list_available?.filter(
              (value, idx, self) =>
                idx === self.findIndex((t) => t.supplier?.id === value.supplier?.id)
            );
          
            const suppliersName = uniqueSuppliers
              ?.map((p) => p.supplier?.name || '')
              .join('\n') || '';

            const supplierCell = doc.createElement('td');
            supplierCell.innerText = suppliersName;
            supplierCell.style.whiteSpace = 'pre-line';
            row.appendChild(supplierCell);

            const imageCell = doc.createElement('td');
            const img = document.createElement('img');
            img.src = product.img;
            img.alt = product.name || 'Image';
            img.style.width = '60px'; 
            img.style.height = 'auto';
            img.style.objectFit = 'contain';
            imageCell.style.textAlign = 'center';
            imageCell.appendChild(img);
            row.appendChild(imageCell);
    
            const descriptionCell = doc.createElement('td');
            descriptionCell.innerText = product.name_variant || 'No description';
            row.appendChild(descriptionCell);

            const categoryCell = doc.createElement('td');
            categoryCell.innerText = product.product_category.name || '';
            row.appendChild(categoryCell);
    
            const costCell = doc.createElement('td');
            costCell.style.textAlign = 'right';
            costCell.innerText = product.cost ? `${Number(product.cost).toFixed(2).toLocaleString()}` : '0.00';
            row.appendChild(costCell);
    
            const totalCell = doc.createElement('td');
            totalCell.style.textAlign = 'right';
            totalCell.innerText = product.price ? `${Number(product.price).toFixed(2).toLocaleString()}` : '0.00';
            row.appendChild(totalCell);

            const qtyCell = doc.createElement('td');
            qtyCell.style.textAlign = 'center';
            const qtyValue = product.qty ? (Number(product.qty) % 1 === 0 ? Number(product.qty) : Number(product.qty).toFixed(2)) : '0';
            qtyCell.innerText = qtyValue;
            row.appendChild(qtyCell);
    
            tbody.appendChild(row);
        });

        table.appendChild(tbody);

        body.appendChild(header);
        body.appendChild(title);
        body.appendChild(table);
        doc.body.replaceWith(body);
    
        let imagesLoaded = 0;
        const totalImages = 2; 

        function checkAndPrint() {
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
                printWindow.document.close();
                printWindow.print();
            }
        }

        leftLogo.onload = checkAndPrint;
        // middleLogo.onload = checkAndPrint;

        setTimeout(() => {
            if (imagesLoaded < totalImages) {
                printWindow.document.close();
                printWindow.print();
            }
        }, 3000);
};