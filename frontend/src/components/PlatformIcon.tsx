import { ExternalLink } from 'lucide-react';

export const getPlatformName = (url: string) => {
  if (!url) return 'External';
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('leetcode.com')) return 'LeetCode';
  if (lowerUrl.includes('geeksforgeeks.org')) return 'GeeksforGeeks';
  if (lowerUrl.includes('codechef.com')) return 'CodeChef';
  if (lowerUrl.includes('codeforces.com')) return 'Codeforces';
  if (lowerUrl.includes('hackerrank.com')) return 'HackerRank';
  if (lowerUrl.includes('hackerearth.com')) return 'HackerEarth';
  if (lowerUrl.includes('codingninjas.com')) return 'CodingNinjas';
  if (lowerUrl.includes('interviewbit.com')) return 'InterviewBit';
  return 'External';
};

export const getDomain = (url: string) => {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
  } catch {
    return '';
  }
};

export const PlatformIcon = ({ name, url }: { name: string, url: string }) => {
  const getLogo = () => {
    const domain = getDomain(url);
    if (name === 'LeetCode') return <img src="https://upload.wikimedia.org/wikipedia/commons/8/8e/LeetCode_Logo_1.png" alt="LeetCode" className="w-4 h-4 object-contain" />;
    if (name === 'GeeksforGeeks') return <img src="https://upload.wikimedia.org/wikipedia/commons/4/43/GeeksforGeeks.svg" alt="GeeksforGeeks" className="w-4 h-4 object-contain" />;
    if (name === 'CodeChef') return <span className="font-bold text-xs text-amber-700 dark:text-amber-500 tracking-tighter">CC</span>;
    if (name === 'Codeforces') return <img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Codeforces_logo.svg" alt="Codeforces" className="w-4 h-4 object-contain" />;
    
    if (domain) {
      return <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt={name} className="w-4 h-4 object-contain rounded-sm" />;
    }
    return <ExternalLink className="w-3.5 h-3.5 text-slate-500" />;
  };

  return (
    <a 
      href={url.startsWith('http') ? url : `https://${url}`} 
      target="_blank" 
      rel="noreferrer" 
      title={name}
      className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
    >
      {getLogo()}
    </a>
  );
};
