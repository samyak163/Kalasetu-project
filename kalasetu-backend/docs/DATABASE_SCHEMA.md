# KalaSetu Database Schema Documentation

**Generated on:** 11/11/2025, 2:44:43 PM

**Database:** MongoDB Atlas

---

## Admin Collection

**Description:** Admin users who manage the platform

**Documents Count:** 1

### Fields (Schema)

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| fullName | String | ✓ | Full name of the user |
| email | String | ✓ | Email address |
| password | String | ✓ | Encrypted password |
| role | String | - | - |
| permissions.users.view | Boolean | - | - |
| permissions.users.edit | Boolean | - | - |
| permissions.users.delete | Boolean | - | - |
| permissions.users.verify | Boolean | - | - |
| permissions.artisans.view | Boolean | - | - |
| permissions.artisans.edit | Boolean | - | - |
| permissions.artisans.delete | Boolean | - | - |
| permissions.artisans.verify | Boolean | - | - |
| permissions.artisans.suspend | Boolean | - | - |
| permissions.bookings.view | Boolean | - | - |
| permissions.bookings.edit | Boolean | - | - |
| permissions.bookings.cancel | Boolean | - | - |
| permissions.bookings.refund | Boolean | - | - |
| permissions.payments.view | Boolean | - | - |
| permissions.payments.process | Boolean | - | - |
| permissions.payments.refund | Boolean | - | - |
| permissions.reviews.view | Boolean | - | - |
| permissions.reviews.moderate | Boolean | - | - |
| permissions.reviews.delete | Boolean | - | - |
| permissions.analytics.view | Boolean | - | - |
| permissions.analytics.export | Boolean | - | - |
| permissions.settings.view | Boolean | - | - |
| permissions.settings.edit | Boolean | - | - |
| profileImage | String | - | - |
| isActive | Boolean | - | Account active status |
| lastLogin | Date | - | - |
| activityLog.0.timestamp | Date | - | - |

### Indexes

- email

---

## Artisan Collection

**Description:** Service providers (artisans) registered on the platform

**Documents Count:** 27

### Fields (Schema)

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| publicId | String | - | - |
| slug | String | - | - |
| firebaseUid | String | - | - |
| fullName | String | ✓ | Full name of the user |
| email | String | - | Email address |
| phoneNumber | String | - | Contact phone number |
| password | String | ✓ | Encrypted password |
| craft | String | - | - |
| businessName | String | - | - |
| tagline | String | - | - |
| location | Mixed | - | Geographic location data |
| bio | String | - | - |
| profileImageUrl | String | - | - |
| profileImagePublicId | String | - | - |
| coverImageUrl | String | - | - |
| portfolioImageUrls | Array<String> | - | - |
| isActive | Boolean | - | Account active status |
| isVerified | Boolean | - | Verification status |
| yearsOfExperience | String | - | - |
| teamSize | String | - | - |
| languagesSpoken | Array<String> | - | - |
| certifications | Array<Mixed> | - | - |
| businessPhone | String | - | - |
| whatsappNumber | String | - | - |
| workingHours | Mixed | - | - |
| emergencyServices | Boolean | - | - |
| serviceRadius | Number | - | - |
| minimumBookingNotice | Number | - | - |
| verificationDocuments | Mixed | - | - |
| bankDetails | Mixed | - | - |
| businessType | String | - | - |
| gstNumber | String | - | - |
| gstVerified | Boolean | - | - |
| profileViews | Number | - | - |
| totalBookings | Number | - | - |
| completedBookings | Number | - | - |
| cancelledBookings | Number | - | - |
| totalEarnings | Number | - | - |
| averageRating | Number | - | - |
| totalReviews | Number | - | - |
| responseRate | Number | - | - |
| acceptanceRate | Number | - | - |
| autoAcceptBookings | Boolean | - | - |
| bufferTimeBetweenBookings | Number | - | - |
| maxBookingsPerDay | Number | - | - |
| advancePaymentPercentage | Number | - | - |
| notifications | Mixed | - | - |
| subscriptionPlan | String | - | - |
| subscriptionExpiresAt | Date | - | - |
| lastLoginAt | Date | - | - |
| isOnline | Boolean | - | - |
| vacationMode | Mixed | - | - |
| lockUntil | Date | - | - |
| loginAttempts | Number | - | - |
| resetPasswordToken | String | - | - |
| resetPasswordExpires | Date | - | - |
| emailVerificationToken | String | - | - |
| emailVerificationExpires | Date | - | - |
| emailVerified | Boolean | - | - |
| pendingEmail | String | - | - |
| emailVerificationCode | String | - | - |
| pendingPhoneNumber | String | - | - |
| phoneVerificationCode | String | - | - |
| phoneVerificationExpires | Date | - | - |
| otpCode | String | - | - |
| otpExpires | Date | - | - |
| otpAttempts | Number | - | - |

### Indexes

- publicId
- slug
- firebaseUid
- email
- phoneNumber
- location
- createdAt
- location.city, location.state

---

## User Collection

**Description:** End users who book services

**Documents Count:** 1

### Fields (Schema)

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| fullName | String | ✓ | Full name of the user |
| email | String | - | Email address |
| phoneNumber | String | - | Contact phone number |
| password | String | ✓ | Encrypted password |
| lockUntil | Date | - | - |
| loginAttempts | Number | - | - |
| resetPasswordToken | String | - | - |
| resetPasswordExpires | Date | - | - |
| emailVerificationToken | String | - | - |
| emailVerificationExpires | Date | - | - |
| emailVerified | Boolean | - | - |
| otpCode | String | - | - |
| otpExpires | Date | - | - |
| otpAttempts | Number | - | - |
| bookmarks.0 | SchemaObjectId | - | - |

### Indexes

- email
- phoneNumber
- createdAt

---

## Category Collection

**Description:** Service categories (Handicrafts, Home Services, etc.)

**Documents Count:** 6

### Fields (Schema)

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| name | String | ✓ | - |
| slug | String | ✓ | - |
| image | String | - | - |
| suggestedServices | Array<Mixed> | - | - |
| active | Boolean | - | - |

### Indexes

- name
- slug

---

## ArtisanService Collection

**Description:** Services offered by artisans

**Documents Count:** 25

### Fields (Schema)

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| artisan | SchemaObjectId | ✓ | - |
| category | SchemaObjectId | ✓ | - |
| categoryName | String | ✓ | - |
| name | String | ✓ | - |
| description | String | - | Detailed description |
| price | Number | - | Price in INR |
| currency | String | - | - |
| durationMinutes | Number | - | - |
| images | Array<String> | - | - |
| isActive | Boolean | - | Account active status |

### Indexes

- artisan
- category
- name, description, categoryName
- categoryName, name

---

## Booking Collection

**Description:** Service booking requests and appointments

**Documents Count:** 0

### Fields (Schema)

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| artisan | SchemaObjectId | ✓ | - |
| user | SchemaObjectId | ✓ | - |
| service | SchemaObjectId | - | - |
| serviceName | String | - | - |
| categoryName | String | - | - |
| start | Date | ✓ | - |
| end | Date | ✓ | - |
| status | String | - | Current status |
| notes | String | - | - |
| price | Number | - | Price in INR |
| depositPaid | Boolean | - | - |
| requestedAt | Date | - | - |
| respondedAt | Date | - | - |
| rejectionReason | String | - | - |
| chatChannelId | String | - | - |
| videoRoomName | String | - | - |
| videoRoomUrl | String | - | - |

### Indexes

- artisan
- user
- service
- status
- artisan, start, end

---

## Review Collection

**Description:** Customer reviews and ratings for artisans

**Documents Count:** 1

### Fields (Schema)

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| artisan | SchemaObjectId | ✓ | - |
| user | SchemaObjectId | ✓ | - |
| booking | SchemaObjectId | - | - |
| rating | Number | ✓ | Rating score |
| comment | String | ✓ | - |
| images.0 | String | - | - |
| response.text | String | - | - |
| helpfulVotes.0 | SchemaObjectId | - | - |
| isVerified | Boolean | - | Verification status |
| status | String | - | Current status |

### Indexes

- artisan
- user, booking

---

## Payment Collection

**Description:** Payment transactions via Razorpay

**Documents Count:** 1

### Fields (Schema)

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| orderId | String | ✓ | - |
| razorpayOrderId | String | ✓ | - |
| razorpayPaymentId | String | - | - |
| razorpaySignature | String | - | - |
| amount | Number | ✓ | - |
| currency | String | - | - |
| status | String | - | Current status |
| payerId | SchemaObjectId | ✓ | - |
| payerModel | String | ✓ | - |
| recipientId | SchemaObjectId | - | - |
| recipientModel | String | - | - |
| purpose | String | ✓ | - |
| description | String | - | Detailed description |
| metadata | SchemaMixed | - | - |
| refundId | String | - | - |
| refundAmount | Number | - | - |
| refundedAt | Date | - | - |

### Indexes

- orderId
- razorpayOrderId
- razorpayPaymentId
- payerId, status
- recipientId, status

---

## Notification Collection

**Description:** Push notifications sent to users

**Documents Count:** 37

### Fields (Schema)

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| ownerId | SchemaObjectId | ✓ | - |
| ownerType | String | ✓ | - |
| title | String | - | - |
| text | String | ✓ | - |
| url | String | - | - |
| read | Boolean | - | - |

### Indexes

- ownerId
- ownerType
- read
- ownerId, ownerType, createdAt

---

## Availability Collection

**Description:** Artisan availability schedules

**Documents Count:** 0

### Fields (Schema)

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| artisan | SchemaObjectId | ✓ | - |
| recurringSchedule.0.dayOfWeek | Number | - | - |
| recurringSchedule.0.slots.0.isActive | Boolean | - | Account active status |
| exceptions.0.slots.0.isActive | Boolean | - | Account active status |
| bufferTime | Number | - | - |
| advanceBookingDays | Number | - | - |
| minNoticeHours | Number | - | - |

### Indexes

- artisan

---

## CallHistory Collection

**Description:** Video call history records

**Documents Count:** 25

### Fields (Schema)

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| artisan | SchemaObjectId | - | - |
| user | SchemaObjectId | - | - |
| startedAt | Date | ✓ | - |
| endedAt | Date | - | - |
| durationSec | Number | - | - |
| type | String | - | - |
| status | String | - | Current status |

### Indexes

- artisan
- user
- artisan, startedAt
- user, startedAt

---

## Database Summary

| Collection | Documents | Purpose |
|------------|-----------|----------|
| Admin | 1 | Admin users who manage the platform |
| Artisan | 27 | Service providers (artisans) registered on the platform |
| User | 1 | End users who book services |
| Category | 6 | Service categories (Handicrafts, Home Services, etc.) |
| ArtisanService | 25 | Services offered by artisans |
| Booking | 0 | Service booking requests and appointments |
| Review | 1 | Customer reviews and ratings for artisans |
| Payment | 1 | Payment transactions via Razorpay |
| Notification | 37 | Push notifications sent to users |
| Availability | 0 | Artisan availability schedules |
| CallHistory | 25 | Video call history records |
