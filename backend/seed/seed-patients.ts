import { db } from '../src/db/utils';
import { patients, tenants } from './schema';
import * as schema from './schema';

const maleFirstNames = [
  'Aarav', 'Arjun', 'Aryan', 'Advait', 'Kabir', 'Krishna', 'Rohan', 'Ravi',
  'Vikram', 'Sanjay', 'Rajesh', 'Anil', 'Suresh', 'Pradeep', 'Karthik',
  'Siddharth', 'Ashok', 'Manoj', 'Vinay', 'Harish', 'Amit', 'Rahul',
  'Nikhil', 'Varun', 'Aditya', 'Akash', 'Kunal', 'Pankaj', 'Vivek',
  'Tarun', 'Gaurav', 'Abhishek', 'Ankit', 'Mohit', 'Sumit', 'Naveen',
  'Ramesh', 'Dinesh', 'Prakash', 'Santosh', 'Gopal', 'Vimal', 'Sachin',
  'Devendra', 'Mahesh', 'Yash', 'Shiv', 'Vishal', 'Sandeep', 'Deepak',
];

const femaleFirstNames = [
  'Aadhya', 'Ananya', 'Diya', 'Ishita', 'Kavya', 'Meera', 'Priya', 'Saanvi',
  'Shruti', 'Neha', 'Pooja', 'Anjali', 'Divya', 'Swati', 'Riya', 'Sneha',
  'Pallavi', 'Deepa', 'Sonal', 'Nisha', 'Simran', 'Tanvi', 'Aditi', 'Vidya',
  'Lakshmi', 'Shweta', 'Manisha', 'Archana', 'Rekha', 'Seema', 'Asha',
  'Kavita', 'Sunita', 'Geeta', 'Radha', 'Vandana', 'Kamala', 'Usha',
  'Sita', 'Mira', 'Tara', 'Jaya', 'Maya', 'Lata', 'Rita', 'Sushma',
];

const lastNames = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Reddy', 'Rao', 'Gupta', 'Verma',
  'Mehta', 'Desai', 'Joshi', 'Iyer', 'Nair', 'Kulkarni', 'Choudhary',
  'Agarwal', 'Kapoor', 'Malhotra', 'Bose', 'Chatterjee', 'Mukherjee',
  'Banerjee', 'Menon', 'Shetty', 'Pillai', 'Yadav', 'Pandey', 'Mishra',
  'Tiwari', 'Dubey', 'Saxena', 'Khanna', 'Chopra', 'Arora', 'Sethi',
  'Bajaj', 'Goel', 'Singhal', 'Agnihotri', 'Bhatt', 'Trivedi', 'Shah',
  'Gandhi', 'Parekh', 'Modi', 'Thakkar', 'Vyas', 'Dixit', 'Chawla',
];

const indianCities = [
  { name: 'Mumbai', state: 'Maharashtra', postalCode: '400001' },
  { name: 'Delhi', state: 'Delhi', postalCode: '110001' },
  { name: 'Bangalore', state: 'Karnataka', postalCode: '560001' },
  { name: 'Hyderabad', state: 'Telangana', postalCode: '500001' },
  { name: 'Ahmedabad', state: 'Gujarat', postalCode: '380001' },
  { name: 'Chennai', state: 'Tamil Nadu', postalCode: '600001' },
  { name: 'Kolkata', state: 'West Bengal', postalCode: '700001' },
  { name: 'Pune', state: 'Maharashtra', postalCode: '411001' },
  { name: 'Jaipur', state: 'Rajasthan', postalCode: '302001' },
  { name: 'Surat', state: 'Gujarat', postalCode: '395001' },
  { name: 'Lucknow', state: 'Uttar Pradesh', postalCode: '226001' },
  { name: 'Kanpur', state: 'Uttar Pradesh', postalCode: '208001' },
  { name: 'Nagpur', state: 'Maharashtra', postalCode: '440001' },
  { name: 'Indore', state: 'Madhya Pradesh', postalCode: '452001' },
  { name: 'Thane', state: 'Maharashtra', postalCode: '400601' },
  { name: 'Bhopal', state: 'Madhya Pradesh', postalCode: '462001' },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', postalCode: '530001' },
  { name: 'Patna', state: 'Bihar', postalCode: '800001' },
  { name: 'Vadodara', state: 'Gujarat', postalCode: '390001' },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', postalCode: '201001' },
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

const commonAllergies = [
  'None',
  'Peanuts',
  'Dust',
  'Pollen',
  'Penicillin',
  'Latex',
  'Shellfish',
  'Dairy products',
  'Eggs',
  'Soy',
  'Wheat',
  'Insect stings',
  'Pet dander',
  'Sulfa drugs',
];

const chronicConditions = [
  'None',
  'Diabetes Type 2',
  'Hypertension',
  'Asthma',
  'Arthritis',
  'Heart Disease',
  'COPD',
  'Thyroid disorder',
  'High cholesterol',
  'Migraine',
  'Osteoporosis',
  'Depression',
  'Anxiety disorder',
  'Kidney disease',
  'Liver disease',
];

const streetNames = [
  'MG Road', 'Park Street', 'Church Street', 'Brigade Road', 'Residency Road',
  'Commercial Street', 'Richmond Road', 'Cunningham Road', 'Kasturba Road',
  'Linking Road', 'Carter Road', 'Turner Road', 'Hill Road', 'Napean Sea Road',
  'Pedder Road', 'Malabar Hill', 'Walkeshwar Road', 'Marine Drive', 'Colaba',
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(startYear: number, endYear: number): Date {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generatePhoneNumber(): string {
  return `+91${getRandomInt(7000000000, 9999999999)}`;
}

function getRandomAllergies(): string {
  const count = Math.random();
  if (count < 0.4) return 'None';
  if (count < 0.7) return getRandomItem(commonAllergies.filter(a => a !== 'None'));
  return [
    getRandomItem(commonAllergies.filter(a => a !== 'None')),
    getRandomItem(commonAllergies.filter(a => a !== 'None'))
  ].join(', ');
}

function getRandomConditions(): string {
  const count = Math.random();
  if (count < 0.5) return 'None';
  if (count < 0.8) return getRandomItem(chronicConditions.filter(c => c !== 'None'));
  return [
    getRandomItem(chronicConditions.filter(c => c !== 'None')),
    getRandomItem(chronicConditions.filter(c => c !== 'None'))
  ].join(', ');
}

async function seedPatients() {
  console.log('🏥 Seeding patient records for ALL hospitals...\n');

  const allTenants = await db.query.tenants.findMany();
  if (allTenants.length === 0) {
    console.error('❌ No tenants found. Please run hospital registration first.');
    process.exit(1);
  }

  console.log(`Found ${allTenants.length} hospital(s):\n`);
  allTenants.forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.name} (${t.slug})`);
  });
  console.log();

  const patientsPerHospital = 100;
  let globalPatientIndex = 0;
  let globalCreatedCount = 0;

  for (const tenant of allTenants) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🏥 Seeding patients for: ${tenant.name}`);
    console.log(`${'='.repeat(80)}\n`);

    let tenantCreatedCount = 0;

    for (let i = 0; i < patientsPerHospital; i++) {
      globalPatientIndex++;

      const isMale = Math.random() > 0.5;
      const gender = isMale ? 'male' : (Math.random() > 0.95 ? 'other' : 'female');
      const firstName = isMale
        ? getRandomItem(maleFirstNames)
        : getRandomItem(femaleFirstNames);
      const lastName = getRandomItem(lastNames);

      const ageGroup = Math.random();
      let dateOfBirth: Date;
      if (ageGroup < 0.1) {
        dateOfBirth = getRandomDate(2010, 2023);
      } else if (ageGroup < 0.7) {
        dateOfBirth = getRandomDate(1970, 2005);
      } else {
        dateOfBirth = getRandomDate(1935, 1970);
      }

      const city = getRandomItem(indianCities);
      const streetNumber = getRandomInt(1, 999);
      const streetName = getRandomItem(streetNames);
      const emailName = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${globalPatientIndex}`;
      const email = Math.random() > 0.2 ? `${emailName}@gmail.com` : null;

      const emergencyFirstName = isMale
        ? getRandomItem(femaleFirstNames)
        : getRandomItem(maleFirstNames);
      const emergencyLastName = getRandomItem(lastNames);

      const isActive = Math.random() > 0.1;

      try {
        await db.insert(patients).values({
          tenantId: tenant.id,
          firstName,
          lastName,
          email,
          phone: generatePhoneNumber(),
          dateOfBirth,
          gender,
          bloodGroup: getRandomItem(bloodGroups),
          address: `${streetNumber}, ${streetName}`,
          city: city.name,
          state: city.state,
          postalCode: city.postalCode,
          country: 'India',
          emergencyContactName: `${emergencyFirstName} ${emergencyLastName}`,
          emergencyContactPhone: generatePhoneNumber(),
          allergies: getRandomAllergies(),
          chronicConditions: getRandomConditions(),
          isActive,
        });

        tenantCreatedCount++;
        globalCreatedCount++;

        if (tenantCreatedCount % 20 === 0) {
          console.log(`   ✓ Created ${tenantCreatedCount} patients for this hospital...`);
        }
      } catch (error) {
        console.error(`   ❌ Failed to create patient ${firstName} ${lastName}:`, error);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✨ Completed seeding for: ${tenant.name}`);
    console.log(`📊 Created ${tenantCreatedCount} patients in this hospital`);
    console.log(`${'='.repeat(60)}\n`);
  }

  console.log(`✅ Patients seeded: ${globalCreatedCount} total across ${allTenants.length} hospitals`);
}

export async function seedPatients() {
  await seedPatientsInternal();
}
