import React from 'react';

const CancellationRefund = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Cancellation & Refund Policy</h1>
      
      <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
        <p className="text-sm text-gray-500">Last Updated: November 1, 2025</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">1. Overview</h2>
          <p>
            At KalaSetu, we want you to be completely satisfied with your purchase. This policy outlines 
            the terms for cancellations and refunds on products purchased through our marketplace.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">2. Order Cancellation</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6">2.1 Cancellation by Customer</h3>
          <p>You can cancel your order in the following situations:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Before Shipment:</strong> Orders can be cancelled within 24 hours of placement 
              if the artisan has not yet shipped the product. Full refund will be processed.
            </li>
            <li>
              <strong>After Shipment:</strong> Once the order is shipped, cancellation is not possible. 
              You may request a return after receiving the product (see Return Policy below).
            </li>
            <li>
              <strong>Custom/Made-to-Order Items:</strong> Cannot be cancelled once production has started 
              as these items are made specifically for you.
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">2.2 Cancellation by Artisan</h3>
          <p>In rare cases, an artisan may cancel your order due to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Product unavailability or stock issues</li>
            <li>Inability to fulfill the order</li>
            <li>Incorrect pricing or product information</li>
          </ul>
          <p className="mt-2">
            If an artisan cancels your order, you will receive a full refund within 5-7 business days.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">3. Return & Exchange Policy</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6">3.1 Eligible Returns</h3>
          <p>You can return products within <strong>7 days of delivery</strong> if:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Product received is damaged or defective</li>
            <li>Wrong product was delivered</li>
            <li>Product is significantly different from the description</li>
            <li>Product has manufacturing defects</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">3.2 Non-Returnable Items</h3>
          <p>The following items cannot be returned:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Custom or personalized products</li>
            <li>Products damaged due to misuse or negligence</li>
            <li>Items marked as "non-returnable" on the product page</li>
            <li>Products without original packaging and tags</li>
            <li>Perishable goods (food items, flowers, etc.)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">3.3 Return Process</h3>
          <p>To initiate a return:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Contact us at <strong>returns@kalasetu.com</strong> within 7 days of delivery</li>
            <li>Provide order number, reason for return, and photos (if applicable)</li>
            <li>Wait for return approval from our team</li>
            <li>Pack the item securely in original packaging</li>
            <li>Ship to the address provided in return confirmation</li>
            <li>Provide tracking information to us</li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">4. Refund Policy</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6">4.1 Refund Timeline</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Order Cancellation:</strong> 5-7 business days from cancellation</li>
            <li><strong>Return Accepted:</strong> 7-10 business days after product verification</li>
            <li><strong>Failed Delivery:</strong> 5-7 business days from return to artisan</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">4.2 Refund Method</h3>
          <p>Refunds will be processed to your original payment method:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Credit/Debit Card:</strong> 5-7 business days</li>
            <li><strong>UPI/Net Banking:</strong> 3-5 business days</li>
            <li><strong>Wallet:</strong> Instant to 24 hours</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">4.3 Partial Refunds</h3>
          <p>Partial refunds may be issued in the following cases:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Product returned without original packaging</li>
            <li>Product shows signs of use or damage</li>
            <li>Missing accessories or components</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">5. Exchange Policy</h2>
          <p>
            We currently do not offer direct exchanges. If you wish to exchange a product, 
            please return the original item for a refund and place a new order for the desired product.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">6. Return Shipping Costs</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Defective/Wrong Product:</strong> KalaSetu will cover return shipping costs
            </li>
            <li>
              <strong>Change of Mind:</strong> Customer is responsible for return shipping costs
            </li>
            <li>
              <strong>Custom Orders:</strong> Returns not accepted unless defective
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">7. Quality Assurance</h2>
          <p>
            All products are checked by artisans before shipping. However, if you receive a defective 
            or damaged product, please contact us immediately with photos. We will work with the artisan 
            to resolve the issue promptly.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">8. Contact for Returns & Refunds</h2>
          <p>
            For any queries related to cancellations, returns, or refunds:
            <br />
            <strong>Email:</strong> returns@kalasetu.com
            <br />
            <strong>Phone:</strong> +91-XXXXXXXXXX
            <br />
            <strong>Hours:</strong> Monday-Saturday, 10 AM - 6 PM IST
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">9. Dispute Resolution</h2>
          <p>
            If you have any disputes regarding cancellations, returns, or refunds, please contact our 
            customer support team. We will make every effort to resolve the issue fairly and promptly.
          </p>
        </section>

        <div className="mt-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> This policy is subject to change. Please review it periodically for updates. 
            The artisan reserves the right to refuse returns that don't meet the criteria outlined above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CancellationRefund;
