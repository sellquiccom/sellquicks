
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

const products = [
    { id: '1', name: 'Classic Leather Sneakers', price: 'GHS 250.00', stock: 50 },
    { id: '2', name: 'Running Shoes', price: 'GHS 350.00', stock: 30 },
    { id: '3', name: 'High-Top Canvas', price: 'GHS 180.00', stock: 75 },
    { id: '4', name: 'Formal Leather Loafers', price: 'GHS 450.00', stock: 20 },
];

export default function ProductsPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>Manage your products and view their sales performance.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/dashboard/products/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Product
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
