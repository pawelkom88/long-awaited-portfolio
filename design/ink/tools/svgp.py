import re
TOK=re.compile(r'[MmLlHhVvCcSsQqTtAaZz]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?')
N={'M':2,'L':2,'H':1,'V':1,'C':6,'S':4,'Q':4,'T':2,'A':7,'Z':0}
def fmt(v): 
    s=f'{v:.1f}'.rstrip('0').rstrip('.'); return '0' if s=='-0' else s
def subpaths(d):
    """absolute subpaths: list of (d_string, [points incl. control points])"""
    t=TOK.findall(d); i=0; cmd=None; x=y=0; sx=sy=0; out=[]; cur=None; pts=None
    while i<len(t):
        if re.match('[A-Za-z]',t[i]): cmd=t[i]; i+=1
            
        C=cmd.upper(); rel=cmd.islower()
        if C=='Z':
            cur.append('Z'); x,y=sx,sy; continue
        a=[float(v) for v in t[i:i+N[C]]]; i+=N[C]
        if C=='M':
            if rel: a=[a[0]+x,a[1]+y]
            x,y=a; sx,sy=x,y; cur=[f'M{fmt(x)} {fmt(y)}']; pts=[(x,y)]; out.append((cur,pts))
            cmd='l' if rel else 'L'; continue
        if C=='H': a=[a[0]+(x if rel else 0), y]; C='L'
        elif C=='V': a=[x, a[0]+(y if rel else 0)]; C='L'
        elif C=='A':
            if rel: a[5]+=x; a[6]+=y
            cur.append('A'+' '.join(fmt(v) for v in a)); x,y=a[5],a[6]; pts.append((x,y)); continue
        elif rel:
            a=[v+(x if k%2==0 else y) for k,v in enumerate(a)]
        cur.append(C+' '.join(fmt(v) for v in a))
        for k in range(0,len(a),2): pts.append((a[k],a[k+1]))
        x,y=a[-2],a[-1]
    return [(''.join(c),p) for c,p in out]
def bbox(p): xs=[q[0] for q in p]; ys=[q[1] for q in p]; return min(xs),min(ys),max(xs),max(ys)
def paths(svg): return re.findall(r'<path[^>]*\sd="([^"]+)"',svg)
