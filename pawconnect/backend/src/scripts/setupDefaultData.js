const { docClient, TABLES } = require('../config/aws');
const { PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

// Create a default shelter if none exists
async function createDefaultShelter() {
  console.log('Checking for existing shelters...');
  
  try {
    const scanCommand = new ScanCommand({
      TableName: TABLES.USERS,
      FilterExpression: 'userType = :type',
      ExpressionAttributeValues: {
        ':type': 'shelter',
      },
    });
    
    const result = await docClient.send(scanCommand);
    
    if (result.Items && result.Items.length > 0) {
      console.log(`Found ${result.Items.length} existing shelter(s)`);
      return result.Items[0].userId;
    }
    
    console.log('No shelters found. Creating default shelter...');
    
    const shelterId = uuidv4();
    const defaultShelter = {
      userId: shelterId,
      email: 'shelter@pawconnect.com',
      password: '$2a$10$defaulthashedpassword', // This is just a placeholder
      userType: 'shelter',
      name: 'PawConnect Animal Shelter',
      phone: '555-0100',
      address: '123 Pet Street',
      city: 'San Francisco',
      state: 'California',
      zipCode: '94102',
      description: 'PawConnect Animal Shelter is dedicated to finding loving homes for all animals. We provide care, shelter, and hope to pets in need.',
      website: 'https://pawconnect.com',
      adoptionFee: 150,
      operatingHours: 'Mon-Sat: 10am-6pm, Sun: 12pm-4pm',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      favorites: [],
      profileImage: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400',
    };
    
    const putCommand = new PutCommand({
      TableName: TABLES.USERS,
      Item: defaultShelter,
    });
    
    await docClient.send(putCommand);
    console.log('✓ Default shelter created:', defaultShelter.name);
    return shelterId;
  } catch (error) {
    console.error('Error creating default shelter:', error);
    throw error;
  }
}

// Add default pets
async function addDefaultPets(shelterId) {
  console.log('\nAdding default pets...');
  
  const defaultPets = [
    // Dogs
    {
      name: 'Max',
      breed: 'Golden Retriever',
      species: 'dog',
      age: 3,
      weight: 65,
      gender: 'male',
      description: 'Max is a friendly and energetic Golden Retriever who loves to play fetch and go on long walks. He is great with children and other dogs. Max is house-trained and knows basic commands. He would thrive in an active family environment.',
      shortDescription: 'Friendly and energetic Golden Retriever who loves to play and is great with children.',
      characteristics: ['Friendly', 'Energetic', 'Good with kids', 'House-trained', 'Good with other dogs'],
      city: 'San Francisco',
      state: 'California',
      images: ['https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800'],
    },
    {
      name: 'Bella',
      breed: 'Labrador Retriever',
      species: 'dog',
      age: 2,
      weight: 55,
      gender: 'female',
      description: 'Bella is a sweet and gentle Labrador who loves cuddles and treats. She is well-behaved, calm, and perfect for families. Bella enjoys swimming and playing in the yard. She is spayed and up to date on all vaccinations.',
      shortDescription: 'Sweet and gentle Labrador who loves cuddles and is perfect for families.',
      characteristics: ['Gentle', 'Calm', 'Good with kids', 'Loves water', 'Spayed'],
      city: 'Los Angeles',
      state: 'California',
      images: ['https://images.unsplash.com/photo-1628407992839-5e89e5257e8d?w=800'],
    },
    {
      name: 'Rocky',
      breed: 'German Shepherd',
      species: 'dog',
      age: 4,
      weight: 75,
      gender: 'male',
      description: 'Rocky is a loyal and protective German Shepherd looking for an experienced owner. He is well-trained and responds to commands. Rocky needs daily exercise and mental stimulation. He would do best as the only pet in the household.',
      shortDescription: 'Loyal and protective German Shepherd looking for an experienced owner.',
      characteristics: ['Loyal', 'Protective', 'Well-trained', 'Active', 'Needs experienced owner'],
      city: 'Austin',
      state: 'Texas',
      images: ['https://images.unsplash.com/photo-1568572933382-74d440642117?w=800'],
    },
    {
      name: 'Luna',
      breed: 'Husky',
      species: 'dog',
      age: 1,
      weight: 45,
      gender: 'female',
      description: 'Luna is a playful and energetic Husky puppy with beautiful blue eyes. She loves to run and play and needs an active family. Luna is still learning commands and would benefit from training classes. She gets along well with other dogs.',
      shortDescription: 'Playful Husky puppy with beautiful blue eyes, needs an active family.',
      characteristics: ['Playful', 'Energetic', 'Loves to run', 'Good with dogs', 'Needs training'],
      city: 'Seattle',
      state: 'Washington',
      images: ['https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800'],
    },
    {
      name: 'Charlie',
      breed: 'Beagle',
      species: 'dog',
      age: 5,
      weight: 25,
      gender: 'male',
      description: 'Charlie is a friendly and curious Beagle who loves to explore. He is great with children and other pets. Charlie is a food-motivated dog which makes training easy. He enjoys sniffing around the yard and going on adventures.',
      shortDescription: 'Friendly and curious Beagle who loves to explore and is great with children.',
      characteristics: ['Friendly', 'Curious', 'Good with kids', 'Food-motivated', 'Good with pets'],
      city: 'Boston',
      state: 'Massachusetts',
      images: ['https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=800'],
    },
    {
      name: 'Daisy',
      breed: 'Poodle Mix',
      species: 'dog',
      age: 6,
      weight: 18,
      gender: 'female',
      description: 'Daisy is a small, hypoallergenic Poodle mix perfect for apartment living. She is quiet, well-mannered, and loves to cuddle. Daisy is great with seniors and would make an excellent companion. She is already spayed and house-trained.',
      shortDescription: 'Small hypoallergenic Poodle mix, perfect for apartment living.',
      characteristics: ['Hypoallergenic', 'Quiet', 'Good for apartments', 'Cuddly', 'Low energy'],
      city: 'New York',
      state: 'New York',
      images: ['https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800'],
    },
    {
      name: 'Duke',
      breed: 'Pit Bull Terrier',
      species: 'dog',
      age: 3,
      weight: 60,
      gender: 'male',
      description: 'Duke is a loving and loyal Pit Bull who has a bad reputation but a heart of gold. He is great with his family and loves to play. Duke is strong and needs an owner who can handle his energy. He is neutered and up to date on shots.',
      shortDescription: 'Loving and loyal Pit Bull with a heart of gold.',
      characteristics: ['Loving', 'Loyal', 'Strong', 'Playful', 'Needs active owner'],
      city: 'Miami',
      state: 'Florida',
      images: ['https://images.unsplash.com/photo-1551717743-49959800b1f6?w=800'],
    },
    // Cats
    {
      name: 'Whiskers',
      breed: 'Tabby',
      species: 'cat',
      age: 2,
      weight: 10,
      gender: 'male',
      description: 'Whiskers is a playful tabby cat who loves to chase toys and climb cat trees. He is friendly and curious, always exploring his surroundings. Whiskers is litter-trained and gets along well with other cats. He would do well in any home.',
      shortDescription: 'Playful tabby cat who loves toys and climbing.',
      characteristics: ['Playful', 'Curious', 'Litter-trained', 'Good with cats', 'Indoor cat'],
      city: 'Portland',
      state: 'Oregon',
      images: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800'],
    },
    {
      name: 'Mittens',
      breed: 'Siamese',
      species: 'cat',
      age: 4,
      weight: 8,
      gender: 'female',
      description: 'Mittens is a beautiful Siamese cat with striking blue eyes. She is vocal and loves to "talk" to her humans. Mittens enjoys sitting in sunny spots and being petted. She prefers to be the only cat and would thrive in a quiet home.',
      shortDescription: 'Beautiful vocal Siamese with striking blue eyes.',
      characteristics: ['Vocal', 'Affectionate', 'Indoor cat', 'Prefers to be only cat', 'Loves attention'],
      city: 'Chicago',
      state: 'Illinois',
      images: ['https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800'],
    },
    {
      name: 'Shadow',
      breed: 'Black Domestic Shorthair',
      species: 'cat',
      age: 3,
      weight: 12,
      gender: 'male',
      description: 'Shadow is a sleek black cat with a mysterious personality. He is independent but enjoys affection on his own terms. Shadow is a skilled hunter and would love access to a safe outdoor space. He is neutered and healthy.',
      shortDescription: 'Sleek black cat with independent personality.',
      characteristics: ['Independent', 'Mysterious', 'Good hunter', 'Likes outdoor access', 'Neutered'],
      city: 'Denver',
      state: 'Colorado',
      images: ['https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=800'],
    },
    {
      name: 'Luna',
      breed: 'Persian',
      species: 'cat',
      age: 5,
      weight: 11,
      gender: 'female',
      description: 'Luna is a gorgeous long-haired Persian who requires daily grooming. She is calm, gentle, and loves to lounge around. Luna is perfect for someone looking for a relaxed companion. She is spayed and has all her vaccinations.',
      shortDescription: 'Gorgeous Persian who loves lounging and requires grooming.',
      characteristics: ['Calm', 'Gentle', 'Requires grooming', 'Indoor cat', 'Low energy'],
      city: 'San Diego',
      state: 'California',
      images: ['https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800'],
    },
    {
      name: 'Oliver',
      breed: 'Orange Tabby',
      species: 'cat',
      age: 1,
      weight: 9,
      gender: 'male',
      description: 'Oliver is a young, playful orange tabby with tons of energy. He loves to play with anything that moves and will keep you entertained for hours. Oliver is friendly with other pets and children. He is litter-trained and ready for a loving home.',
      shortDescription: 'Young playful orange tabby with tons of energy.',
      characteristics: ['Playful', 'Energetic', 'Good with kids', 'Good with pets', 'Kitten'],
      city: 'Phoenix',
      state: 'Arizona',
      images: ['https://images.unsplash.com/photo-1615789591457-74a63395c990?w=800'],
    },
    // Other Pets
    {
      name: 'Thumper',
      breed: 'Holland Lop',
      species: 'other',
      age: 2,
      weight: 4,
      gender: 'male',
      description: 'Thumper is an adorable Holland Lop rabbit with soft floppy ears. He is litter-trained and loves fresh vegetables. Thumper is gentle and would be perfect for a family with children. He needs a spacious enclosure and time to hop around.',
      shortDescription: 'Adorable litter-trained rabbit with floppy ears.',
      characteristics: ['Gentle', 'Litter-trained', 'Good with kids', 'Needs space', 'Loves vegetables'],
      city: 'Atlanta',
      state: 'Georgia',
      images: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800'],
    },
    {
      name: 'Pepper',
      breed: 'Guinea Pig',
      species: 'other',
      age: 1,
      weight: 2,
      gender: 'female',
      description: 'Pepper is a sweet guinea pig who loves to squeak for treats. She is social and would do best with another guinea pig companion. Pepper enjoys munching on hay and fresh veggies. She is easy to care for and very friendly.',
      shortDescription: 'Sweet social guinea pig who loves treats.',
      characteristics: ['Social', 'Friendly', 'Easy care', 'Loves vegetables', 'Vocal'],
      city: 'Nashville',
      state: 'Tennessee',
      images: ['https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800'],
    },
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const petData of defaultPets) {
    try {
      const petId = uuidv4();
      const pet = {
        petId,
        shelterId,
        ...petData,
        adoptionStatus: 'available',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        adoptedBy: null,
      };

      const command = new PutCommand({
        TableName: TABLES.PETS,
        Item: pet,
      });

      await docClient.send(command);
      console.log(`✓ Added: ${pet.name} (${pet.species}) - ${pet.city}, ${pet.state}`);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to add ${petData.name}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Successfully added: ${successCount} pets`);
  console.log(`Failed: ${errorCount} pets`);
}

// Check if pets already exist
async function checkIfPetsExist() {
  try {
    const scanCommand = new ScanCommand({
      TableName: TABLES.PETS,
      Limit: 1,
    });
    
    const result = await docClient.send(scanCommand);
    return result.Items && result.Items.length > 0;
  } catch (error) {
    console.error('Error checking for existing pets:', error.message);
    return false;
  }
}

// Main function
async function setupDefaultData() {
  console.log('🔍 Checking if default data setup is needed...\n');
  
  try {
    // Check if pets already exist
    const petsExist = await checkIfPetsExist();
    if (petsExist) {
      console.log('✓ Pets already exist in database. Skipping seed.\n');
      return { success: true, skipped: true, message: 'Data already exists' };
    }
    
    console.log('📦 Setting up default data for PawConnect...\n');
    const shelterId = await createDefaultShelter();
    await addDefaultPets(shelterId);
    
    console.log('\n✓ Default data setup complete!');
    return { success: true, skipped: false, shelterId };
  } catch (error) {
    console.error('\n✗ Error setting up default data:', error.message);
    return { success: false, error: error.message };
  }
}

// Export for use in other modules
module.exports = { setupDefaultData, createDefaultShelter, addDefaultPets };

// Run the script if executed directly
if (require.main === module) {
  setupDefaultData().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}
