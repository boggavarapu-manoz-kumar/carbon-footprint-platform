const prev = { profilePictureUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=test&backgroundColor=b6e3f4' };
const name = 'gender';
const value = 'FEMALE';
const newData = { ...prev, username: 'test', [name]: value };

if (name === 'gender' && prev.profilePictureUrl && prev.profilePictureUrl.includes('dicebear')) {
  console.log("IT MATCHED!");
} else {
  console.log("IT DID NOT MATCH!");
}
