import type { CSSProperties, ReactNode } from "react";

/** The 3.5" floppy: shutter, label, write-protect notch. */
export function Floppy({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="floppy" style={style}>
      <span className="shutter">
        <span className="shutter-win" />
      </span>
      <div className="lbl">{children}</div>
      <span className="notch" />
    </div>
  );
}

/**
 * The same floppy given ten pixels of thickness: its edges, its back and its
 * shadow as planes around it. Shown instead of the flat one in 3D.
 */
export function Floppy3d({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`f3-w ${className}`} style={style}>
      <div className="f3-fly">
        <div className="f3">
          <i className="f3-sh" />
          <i className="f3-bk" />
          <i className="f3-e t" />
          <i className="f3-e c" />
          <i className="f3-e r" />
          <i className="f3-e b" />
          <i className="f3-e l" />
          <i className="f3-e tl" />
          <i className="f3-e br" />
          <i className="f3-e bl" />
          {children}
        </div>
      </div>
    </div>
  );
}
