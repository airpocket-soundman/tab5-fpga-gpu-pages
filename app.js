const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const viewer = document.createElement('dialog');
viewer.className = 'image-viewer';
viewer.setAttribute('aria-label', '画像の拡大表示');
viewer.innerHTML = '<button class="viewer-close" type="button" aria-label="画像の拡大表示を閉じる">閉じる ×</button><img alt=""><p class="viewer-caption"></p>';
document.body.append(viewer);
const closeViewer = () => viewer.close();
viewer.querySelector('button').addEventListener('click', closeViewer);
viewer.addEventListener('click', event => { if (event.target === viewer) closeViewer(); });
viewer.addEventListener('close', () => { document.body.classList.remove('viewer-open'); });
function openImage(img) {
  viewer.querySelector('img').src = img.currentSrc || img.src;
  viewer.querySelector('img').alt = img.alt;
  viewer.querySelector('.viewer-caption').textContent = img.closest('figure')?.querySelector('figcaption')?.textContent || img.alt;
  viewer.showModal();
  document.body.classList.add('viewer-open');
}
function enableImageZoom() {
  document.querySelectorAll('main img').forEach(img => {
    if (img.closest('button')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'image-zoom';
    button.setAttribute('aria-label', `${img.alt || '画像'}を拡大`);
    img.before(button);
    button.append(img);
    button.addEventListener('click', () => openImage(img));
  });
}
enableImageZoom();
fetch('content.json').then(r => { if (!r.ok) throw Error(r.status); return r.json(); }).then(data => {
  const e = escapeHTML;
  document.querySelector('#updated').textContent = `更新 ${data.updated}`;
  document.querySelector('#facts').innerHTML = data.facts.map(f=>`<div class="fact"><span>${e(f.label)}</span><strong>${e(f.value)}</strong><p>${e(f.note)}</p></div>`).join('');
  document.querySelector('#tracks').innerHTML = data.tracks.map((t,i)=>`<article class="track"><div><span class="track-label">0${i+1} / ${e(t.id.toUpperCase())}</span><h3>${e(t.title)}</h3><p>${e(t.summary)}</p><ul>${t.features.map(x=>`<li>${e(x)}</li>`).join('')}</ul><p class="note">${t.limitations.map(e).join(' / ')}</p></div><figure><img src="assets/${i===0?'game':'compute'}-pipeline.svg" alt="${e(t.title)}の処理の流れ" loading="lazy"></figure></article>`).join('');
  enableImageZoom();
  const labels={done:'● 完了',in_progress:'◐ 進行中',planned:'○ 計画',blocked:'◇ 前提待ち'};
  document.querySelector('#milestones').innerHTML=data.milestones.map(m=>`<article class="milestone"><h3>${e(m.id)} · ${e(m.title)}<span class="tag ${e(m.status)}">${e(labels[m.status]||m.status)}</span></h3><p>${e(m.detail)}</p></article>`).join('');
  document.querySelector('#constraints').innerHTML=data.constraints.map(x=>`<li>${e(x)}</li>`).join('');
  document.querySelector('#benchmarks').innerHTML=data.benchmarks.map(b=>`<div class="bar-row"><span>${e(b.scene)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(0,Math.min(100,b.fps/35*100))}%"></div></div><strong>${Number(b.fps).toFixed(2)}</strong></div>`).join('');
}).catch(()=>{document.querySelector('#updated').textContent='進捗データを取得できませんでした。詳細資料をご覧ください。';});
