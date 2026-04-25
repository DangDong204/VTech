import ProtectedRoute from '@/components/auth/ProtectedRoute'
import ScrollToTop from '@/components/common/ScrollToTop'
import DashboardHome from '@/pages/admin/dashboard/content/DashBoardHome'
import LayoutAdmin from '@/pages/admin/LayoutAdmin'
import BrandPage from '@/pages/admin/manage-brand/page'
import CategoryPage from '@/pages/admin/manage-category/page'
import ColorPage from '@/pages/admin/manage-color/page'
import ProductPage from '@/pages/admin/manage-product/page'
import PromotionPage from '@/pages/admin/manage-promotion/page'
import ReceiptPage from '@/pages/admin/manage-receipt/page'
import TagPage from '@/pages/admin/manage-tag/page'
import UserPage from '@/pages/admin/manage-user/page'
import VariantPage from '@/pages/admin/manage-variant/page'
import VersionPage from '@/pages/admin/manage-version/page'
import VoucherPage from '@/pages/admin/manage-voucher/page'
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import CartPage from '@/pages/user/cart/CartPage'
// import CheckoutPage from '@/pages/user/checkout/CheckoutPage'
import ClientLayout from '@/pages/user/ClientLayout'
import HomePage from '@/pages/user/home/HomePage'
import ProductDetailPage from '@/pages/user/product-detail/ProductDetailPage'
import ProductListPage from '@/pages/user/product-list/ProductListPage'
import AddressesPage from '@/pages/user/profile/AddressesPage'
import ChangePasswordPage from '@/pages/user/profile/ChangePasswordPage'
import OrdersPage from '@/pages/user/profile/OrdersPage'
import OverviewPage from '@/pages/user/profile/OverviewPage'
import ProfileLayout from '@/pages/user/profile/ProfileLayout'
// import ProductListPage from '@/pages/user/product-list/ProductListPage'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <Toaster
        richColors
        expand={true}
        position='bottom-right'
        duration={3000}
        visibleToasts={5}
        closeButton
      />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* <Route path='*' element={<NotFound404 />} /> */}
          {/* TODO: tạo các public route */}
          <Route element={<ClientLayout />}>
            <Route path='/' element={<HomePage />} />
            <Route path='/cart' element={<CartPage />} />
            <Route path='/products' element={<ProductListPage />} />
            <Route path='/product/:slug' element={<ProductDetailPage />} />
            {/* <Route path='/checkout' element={<CheckoutPage />} /> */}
            <Route element={<ProfileLayout />}>
              <Route path='/profile' element={<OverviewPage />} />
              <Route path='/orders' element={<OrdersPage />} />
              <Route path='/addresses' element={<AddressesPage />} />
              <Route path='/change-password' element={<ChangePasswordPage />} />
            </Route>
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
              <Route path='vouchers' element={<VoucherPage />} />
              <Route path='promotions' element={<PromotionPage />} />
              <Route path='receipts' element={<ReceiptPage />} />
            </Route>
          </Route>
          {/* <Route path='/' element={<TestPage />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
