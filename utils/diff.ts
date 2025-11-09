export function calculateDiffScore(original: any, edited: any): number {
  const changes = countChanges(original, edited);
  const totalFields = countTotalFields(original);
  
  if (totalFields === 0) return 0;
  
  return Math.round((changes / totalFields) * 100);
}

function countChanges(obj1: any, obj2: any): number {
  let changes = 0;

  if (typeof obj1 !== typeof obj2) {
    return 1;
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      changes += Math.abs(obj1.length - obj2.length);
    }
    
    const minLength = Math.min(obj1.length, obj2.length);
    for (let i = 0; i < minLength; i++) {
      if (JSON.stringify(obj1[i]) !== JSON.stringify(obj2[i])) {
        changes += 1;
      }
    }
    return changes;
  }

  if (typeof obj1 === 'object' && obj1 !== null && obj2 !== null) {
    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
    
    allKeys.forEach(key => {
      if (!(key in obj1) || !(key in obj2)) {
        changes += 1;
      } else if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
        changes += countChanges(obj1[key], obj2[key]);
      } else if (obj1[key] !== obj2[key]) {
        changes += 1;
      }
    });
    
    return changes;
  }

  return obj1 !== obj2 ? 1 : 0;
}

function countTotalFields(obj: any): number {
  if (typeof obj !== 'object' || obj === null) {
    return 1;
  }

  if (Array.isArray(obj)) {
    return obj.reduce((sum, item) => sum + countTotalFields(item), 0) || 1;
  }

  return Object.keys(obj).reduce((sum, key) => {
    return sum + countTotalFields(obj[key]);
  }, 0);
}