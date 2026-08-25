/**
 * GitHub Content API helper for the private admin dashboard.
 *
 * SECURITY MODEL (GitHub Pages is static):
 * - The fine-grained GitHub token is NEVER written to repository files.
 * - The token is kept in sessionStorage only (current browser tab/session).
 * - Owner/repository/branch are kept separately in localStorage.
 * - Disconnect removes the token and repository configuration.
 * - The token must be scoped by the owner to ONLY this portfolio repository,
 *   with the minimum required permission: Contents -> Read and write.
 *
 * A static GitHub Pages site cannot provide true server-side authentication.
 * The admin password is therefore an additional client-side gate, while the
 * GitHub token is the actual repository authorization.
 */
const GH = {
  STORAGE_KEY: 'gh-config-v2',
  TOKEN_KEY: 'gh-session-token-v2',

  getConfig(){
    try{
      const cfg = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
      const token = sessionStorage.getItem(this.TOKEN_KEY) || '';
      return { ...cfg, token };
    }catch(e){ return { token: '' }; }
  },

  setConfig(cfg){
    const safe = {
      owner: (cfg.owner || '').trim(),
      repo: (cfg.repo || '').trim(),
      branch: (cfg.branch || 'main').trim()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(safe));
    if(cfg.token) sessionStorage.setItem(this.TOKEN_KEY, cfg.token.trim());
  },

  setToken(token){
    if(token) sessionStorage.setItem(this.TOKEN_KEY, token.trim());
    else sessionStorage.removeItem(this.TOKEN_KEY);
  },

  clear(){
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
  },

  isConfigured(){
    const c = this.getConfig();
    return !!(c.owner && c.repo && c.branch && c.token);
  },

  headers(){
    const c = this.getConfig();
    if(!c.token) throw new Error('GitHub is not connected in this browser session.');
    return {
      'Authorization': 'Bearer ' + c.token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
  },

  base(){
    const c = this.getConfig();
    return `https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents`;
  },

  branch(){
    return this.getConfig().branch || 'main';
  },

  b64EncodeUnicode(str){
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (m,p1) => String.fromCharCode('0x' + p1)));
  },

  b64DecodeUnicode(str){
    return decodeURIComponent(atob(str).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  },

  async getFile(path){
    const safePath = path.split('/').map(encodeURIComponent).join('/');
    const res = await fetch(`${this.base()}/${safePath}?ref=${encodeURIComponent(this.branch())}`, { headers: this.headers() });
    if(res.status === 404) return null;
    if(!res.ok) throw new Error(`GitHub read failed (${res.status}): ${path}`);
    return await res.json();
  },

  async getJSON(path){
    const file = await this.getFile(path);
    if(!file) return { data: null, sha: null };
    const text = this.b64DecodeUnicode(file.content.replace(/\n/g, ''));
    return { data: JSON.parse(text), sha: file.sha };
  },

  async putJSON(path, dataObj, message){
    const existing = await this.getFile(path);
    const body = {
      message: message || `Update ${path}`,
      content: this.b64EncodeUnicode(JSON.stringify(dataObj, null, 2)),
      branch: this.branch()
    };
    if(existing) body.sha = existing.sha;
    const safePath = path.split('/').map(encodeURIComponent).join('/');
    const res = await fetch(`${this.base()}/${safePath}`, {
      method:'PUT', headers:{...this.headers(),'Content-Type':'application/json'}, body:JSON.stringify(body)
    });
    if(!res.ok){ const err = await res.text(); throw new Error(`GitHub write failed (${res.status}): ${err}`); }
    return await res.json();
  },

  async putBinaryBase64(path, base64Content, message){
    const existing = await this.getFile(path);
    const body = { message: message || `Upload ${path}`, content: base64Content, branch:this.branch() };
    if(existing) body.sha = existing.sha;
    const safePath = path.split('/').map(encodeURIComponent).join('/');
    const res = await fetch(`${this.base()}/${safePath}`, {
      method:'PUT', headers:{...this.headers(),'Content-Type':'application/json'}, body:JSON.stringify(body)
    });
    if(!res.ok){ const err = await res.text(); throw new Error(`GitHub upload failed (${res.status}): ${err}`); }
    return await res.json();
  },

  async deleteFile(path, message){
    const existing = await this.getFile(path);
    if(!existing) return;
    const safePath = path.split('/').map(encodeURIComponent).join('/');
    const res = await fetch(`${this.base()}/${safePath}`, {
      method:'DELETE', headers:{...this.headers(),'Content-Type':'application/json'},
      body:JSON.stringify({message:message || `Delete ${path}`,sha:existing.sha,branch:this.branch()})
    });
    if(!res.ok){ const err = await res.text(); throw new Error(`GitHub delete failed (${res.status}): ${err}`); }
  },

  async listFolder(path){
    const safePath = path.split('/').map(encodeURIComponent).join('/');
    const res = await fetch(`${this.base()}/${safePath}?ref=${encodeURIComponent(this.branch())}`, {headers:this.headers()});
    if(res.status === 404) return [];
    if(!res.ok) throw new Error(`GitHub list failed (${res.status}): ${path}`);
    return await res.json();
  },

  async testConnection(){
    const c = this.getConfig();
    if(!c.owner || !c.repo || !c.token) throw new Error('Enter the GitHub repository and token first.');
    const res = await fetch(`https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}`, {headers:this.headers()});
    if(!res.ok){
      const msg = await res.text();
      throw new Error(`Could not connect (${res.status}). Check the repository, token, and Contents permission. ${msg.slice(0,180)}`);
    }
    const repo = await res.json();
    if(repo.private === undefined) return repo;
    return repo;
  }
};
