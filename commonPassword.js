import fs from fs;
import path from path;

const commonPassword = new Set();

const loadCommonPassword = () => {
  const filePath = path.join(_dirname, 'rockyou.txt');
  const data = fs.readFileSync(filePath, 'utf8');
  data.split('\n').forEach(password => {
    commonPassword.add(password.trim());
  });
};

loadCommonPassword();

export const isCommonPassword = (password) => {
  return commonPassword.has(password);
}