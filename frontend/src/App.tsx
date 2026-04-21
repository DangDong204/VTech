import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardHome from '@/pages/admin/dashboard/content/DashBoardHome'
import LayoutAdmin from '@/pages/admin/LayoutAdmin'
import BrandPage from '@/pages/admin/manage-brand/page'
import CategoryPage from '@/pages/admin/manage-category/page'
import ColorPage from '@/pages/admin/manage-color/page'
import ProductPage from '@/pages/admin/manage-product/page'
import TagPage from '@/pages/admin/manage-tag/page'
import UserPage from '@/pages/admin/manage-user/page'
import VariantPage from '@/pages/admin/manage-variant/page'
import VersionPage from '@/pages/admin/manage-version/page'
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import CartPage from '@/pages/user/cart/CartPage'
import CheckoutPage from '@/pages/user/checkout/CheckoutPage'
import ClientLayout from '@/pages/user/ClientLayout'
import HomePage from '@/pages/user/home/HomePage'
import ProductDetailPage from '@/pages/user/product-detail/ProductDetailPage'
import ProductListPage from '@/pages/user/product-list/ProductListPage'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <Toaster
        richColors
        expand={false}
        position='bottom-right'
        duration={5000}
        visibleToasts={5}
        closeButton
      />
      <BrowserRouter>
        <Routes>
          {/* <Route path='*' element={<NotFound404 />} /> */}
          {/* TODO: tạo các public route */}
          <Route element={<ClientLayout />}>
            <Route path='/' element={<HomePage />} />
            <Route path='/cart' element={<CartPage />} />
            <Route path='/products' element={<ProductListPage />} />
            <Route path='/product/:slug' element={<ProductDetailPage />} />
            <Route path='/checkout' element={<CheckoutPage />} />
          </Route>

          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignupPage />} />

          {/* TODO: tạo protected route */}
          <Route element={<ProtectedRoute />}>
            {/* <Route path='/profile' element={<ProfilePage />} /> */}
            <Route path='/dashboard' element={<LayoutAdmin />}>
              <Route index element={<DashboardHome />} />
              <Route path='users' element={<UserPage />} />
              <Route path='categories' element={<CategoryPage />} />
              <Route path='brands' element={<BrandPage />} />
              <Route path='tags' element={<TagPage />} />
              <Route path='products' element={<ProductPage />} />
              <Route path='products/:productId/variants' element={<VariantPage />} />
              <Route path='colors' element={<ColorPage />} />
              <Route path='versions' element={<VersionPage />} />
            </Route>
          </Route>
          {/* <Route path='/' element={<TestPage />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
