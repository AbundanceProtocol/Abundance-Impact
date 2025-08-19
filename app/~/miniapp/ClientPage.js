"use client";

export default function ClientPage({ searchParams }) {
  return (
    <div>
      <h1>Impact 2.0 Miniapp</h1>
      <p>id param: {searchParams?.id}</p>
    </div>
  );
}


