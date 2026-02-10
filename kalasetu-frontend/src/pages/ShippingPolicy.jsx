import React from 'react';

const ShippingPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Shipping Policy</h1>
      
      <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
        <p className="text-sm text-gray-500">Last Updated: November 1, 2025</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">1. Overview</h2>
          <p>
            KalaSetu connects users with individual artisans across India. Each artisan is responsible 
            for shipping their own products. Shipping times and costs may vary depending on the artisan's 
            location and shipping method.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">2. Shipping Information</h2>
          <p>
            Shipping details including estimated delivery time and costs are displayed on each product page. 
            Please review this information carefully before placing your order.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">3. Processing Time</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Standard Processing:</strong> 2-5 business days</li>
            <li><strong>Custom Orders:</strong> 7-14 business days (varies by artisan)</li>
            <li><strong>Made-to-Order Items:</strong> Processing time specified on product page</li>
          </ul>
          <p className="mt-2">
            Processing time excludes weekends and holidays. The artisan will begin processing your order 
            after payment confirmation.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">4. Delivery Time</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Metro Cities:</strong> 3-7 business days</li>
            <li><strong>Other Cities:</strong> 5-10 business days</li>
            <li><strong>Remote Areas:</strong> 7-14 business days</li>
          </ul>
          <p className="mt-2">
            Delivery times are estimates and may vary based on courier availability and location. 
            We are not responsible for delays caused by weather, holidays, or courier issues.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">5. Shipping Methods</h2>
          <p>We work with reliable courier partners including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>India Post</li>
            <li>Blue Dart</li>
            <li>DTDC</li>
            <li>Delhivery</li>
            <li>Other regional carriers</li>
          </ul>
          <p className="mt-2">
            The artisan will select the most appropriate shipping method based on your location 
            and the nature of the product.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">6. Shipping Costs</h2>
          <p>
            Shipping costs are calculated based on the product weight, dimensions, destination, 
            and shipping method. The final shipping cost will be displayed at checkout before 
            you complete your purchase.
          </p>
          <p className="mt-2">
            Some artisans may offer free shipping on orders above a certain amount. Check the 
            product page for details.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">7. Order Tracking</h2>
          <p>
            Once your order is shipped, you will receive a tracking number via email and SMS. 
            You can use this number to track your package on the courier's website.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">8. Shipping Address</h2>
          <p>Please ensure your shipping address is complete and accurate:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Include full name of recipient</li>
            <li>Complete street address with house/flat number</li>
            <li>Landmark for easy identification</li>
            <li>Correct PIN code</li>
            <li>Working phone number</li>
          </ul>
          <p className="mt-2 text-red-600">
            We are not responsible for orders delivered to incorrect addresses provided by users.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">9. International Shipping</h2>
          <p>
            Currently, we only ship within India. International shipping may be available in the future. 
            Please check back or contact us for updates.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">10. Damaged or Lost Packages</h2>
          <p>
            If your package arrives damaged or goes missing, please contact us immediately at 
            <strong> support@kalasetu.com</strong> with your order number and photos (if damaged). 
            We will work with the artisan and courier to resolve the issue.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">11. Undelivered Packages</h2>
          <p>
            If the courier is unable to deliver the package due to incorrect address or unavailability 
            of recipient, the package will be returned to the artisan. You may be responsible for 
            re-shipping charges.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">12. Contact Us</h2>
          <p>
            For shipping-related queries, please contact:
            <br />
            <strong>Email:</strong> shipping@kalasetu.com
            <br />
            <strong>Phone:</strong> +91-XXXXXXXXXX
          </p>
        </section>
      </div>
    </div>
  );
};

export default ShippingPolicy;
